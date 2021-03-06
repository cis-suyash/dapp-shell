import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemImageDataRepository } from '../repositories/ItemImageDataRepository';
import { ItemImageData } from '../models/ItemImageData';
import { ItemImageDataCreateRequest } from '../requests/ItemImageDataCreateRequest';
import { ItemImageDataUpdateRequest } from '../requests/ItemImageDataUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class ItemImageDataService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemImageDataRepository) public itemImageDataRepo: ItemImageDataRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemImageData>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemImageData>> {
        return this.itemImageDataRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ItemImageData> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemImageData> {
        const itemImageData = await this.itemImageDataRepo.findOne(id, withRelated);
        if (itemImageData === null) {
            this.log.warn(`ItemImageData with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemImageData;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ItemImageData> {
        return this.create({
            dataId: data.params[0] || '',
            protocol: data.params[1] || '',
            encoding: data.params[2] || '',
            data: data.params[3] || ''
        });
    }

    @validate()
    public async create( @request(ItemImageDataCreateRequest) body: any): Promise<ItemImageData> {

        // If the request body was valid we will create the itemImageData
        const itemImageData = await this.itemImageDataRepo.create(body);

        // finally find and return the created itemImageData
        const newItemImageData = await this.findOne(itemImageData.id);
        return newItemImageData;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ItemImageData> {
        return this.update(data.params[0], {
            dataId: data.params[1] || '',
            protocol: data.params[2] || '',
            encoding: data.params[3] || '',
            data: data.params[4] || ''
        });
    }

    @validate()
    public async update(id: number, @request(ItemImageDataUpdateRequest) body: any): Promise<ItemImageData> {

        // find the existing one without related
        const itemImageData = await this.findOne(id, false);

        // set new values
        itemImageData.DataId = body.dataId;
        itemImageData.Protocol = body.protocol;
        itemImageData.Encoding = body.encoding;
        itemImageData.Data = body.data;

        // update itemImageData record
        const updatedItemImageData = await this.itemImageDataRepo.update(id, itemImageData.toJSON());
        return updatedItemImageData;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.itemImageDataRepo.destroy(id);
    }

}
