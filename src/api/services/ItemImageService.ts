import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemImageRepository } from '../repositories/ItemImageRepository';
import { ItemImage } from '../models/ItemImage';
import { ItemImageCreateRequest } from '../requests/ItemImageCreateRequest';
import { ItemImageUpdateRequest } from '../requests/ItemImageUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemImageDataService } from './ItemImageDataService';

export class ItemImageService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Repository) @named(Targets.Repository.ItemImageRepository) public itemImageRepo: ItemImageRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemImage>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemImage>> {
        return this.itemImageRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ItemImage> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemImage> {
        const itemImage = await this.itemImageRepo.findOne(id, withRelated);
        if (itemImage === null) {
            this.log.warn(`ItemImage with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemImage;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ItemImage> {
        return this.create({
            hash: data.params[0],
            data: {
                dataId: data.params[1] || '',
                protocol: data.params[2] || '',
                encoding: data.params[3] || '',
                data: data.params[4] || ''
            }
        });
    }

    @validate()
    public async create( @request(ItemImageCreateRequest) body: any): Promise<ItemImage> {

        // extract and remove related models from request
        const itemImageData = body.data;
        delete body.data;

        // If the request body was valid we will create the itemImage
        const itemImage = await this.itemImageRepo.create(body);

        // create related models
        itemImageData.item_image_id = itemImage.Id;
        await this.itemImageDataService.create(itemImageData);

        // finally find and return the created itemImage
        const newItemImage = await this.findOne(itemImage.Id);
        return newItemImage;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ItemImage> {
        return this.update(data.params[0], {
            hash: data.params[1],
            data: {
                dataId: data.params[2] || '',
                protocol: data.params[3] || '',
                encoding: data.params[4] || '',
                data: data.params[5] || ''
            }
        });
    }

    @validate()
    public async update(id: number, @request(ItemImageUpdateRequest) body: any): Promise<ItemImage> {

        // find the existing one without related
        const itemImage = await this.findOne(id, false);

        // set new values
        itemImage.Hash = body.hash;

        // update itemImage record
        const updatedItemImage = await this.itemImageRepo.update(id, itemImage.toJSON());

        // find related record and delete it
        let itemImageData = updatedItemImage.related('ItemImageData').toJSON();
        await this.itemImageDataService.destroy(itemImageData.id);

        // recreate related data
        itemImageData = body.data;
        itemImageData.item_image_id = id;
        await this.itemImageDataService.create(itemImageData);

        // finally find and return the updated itemImage
        const newItemImage = await this.findOne(id);
        return newItemImage;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.itemImageRepo.destroy(id);
    }

}
