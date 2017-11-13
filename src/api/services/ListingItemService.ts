import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ListingItemRepository } from '../repositories/ListingItemRepository';
import { ListingItem } from '../models/ListingItem';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItemUpdateRequest } from '../requests/ListingItemUpdateRequest';
import { MessagingInformationService } from './MessagingInformationService';
import { PaymentInformationService } from './PaymentInformationService';
import { ItemInformationService } from './ItemInformationService';
import { ListingItemSearchParams } from '../requests/ListingItemSearchParams';

export class ListingItemService {

    public log: LoggerType;

    constructor(@inject(Types.Service) @named(Targets.Service.ItemInformationService) public itemInformationService: ItemInformationService,
                @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,
                @inject(Types.Service) @named(Targets.Service.MessagingInformationService) public messagingInformationService: MessagingInformationService,
                @inject(Types.Repository) @named(Targets.Repository.ListingItemRepository) public listingItemRepo: ListingItemRepository,
                @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItem>> {
        return await this.listingItemRepo.findAll();
    }

    public async findByCategory(categoryId: number): Promise<Bookshelf.Collection<ListingItem>> {
        this.log.debug('find by category:', categoryId);
        return await this.listingItemRepo.findByCategory(categoryId);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItem> {
        const listingItem = await this.listingItemRepo.findOne(id, withRelated);
        if (listingItem === null) {
            this.log.warn(`ListingItem with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return listingItem;
    }

    /**
     *
     * @param hash, hash of the listing Item.
     * @returns {Promise<ListingItem>}
     */
    public async findOneByHash(hash: string): Promise<ListingItem> {
        const listingItem = await this.listingItemRepo.findOneByHash(hash);
        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return listingItem;
    }

    /**
     * search ListingItems using given ListingItemSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<ListingItem>>}
     */
    @validate()
    public async search(options: ListingItemSearchParams): Promise<Bookshelf.Collection<ListingItem>> {

        // if valid params
        // todo: check whether category is string or number, if string, try to find the Category by key
        return this.listingItemRepo.search(options);
    }

    /**
     * TODO: remove this and add the category as a search param to search
     */
    public async searchByCategoryIdOrName(options: any): Promise<Bookshelf.Collection<ListingItem>> {
        const listingItem = await this.listingItemRepo.searchByCategoryIdOrName(options);
        if (listingItem === null) {
            this.log.warn(`ListingItem with the category=${options[0]} was not found!`);
            throw new NotFoundException(options[0]);
        }
        return listingItem;
    }

    @validate()
    public async create(@request(ListingItemCreateRequest) body: any): Promise<ListingItem> {

        // extract and remove related models from request
        const itemInformation = body.itemInformation;
        delete body.itemInformation;
        const paymentInformation = body.paymentInformation;
        delete body.paymentInformation;
        const messagingInformation = body.messagingInformation;
        delete body.messagingInformation;

        this.log.debug('body: ', body);
        // If the request body was valid we will create the listingItem
        const listingItem = await this.listingItemRepo.create(body);

        // create related models
        itemInformation.listing_item_id = listingItem.Id;
        await this.itemInformationService.create(itemInformation);
        paymentInformation.listing_item_id = listingItem.Id;
        await this.paymentInformationService.create(paymentInformation);
        messagingInformation.listing_item_id = listingItem.Id;
        await this.messagingInformationService.create(messagingInformation);

        // finally find and return the created listingItem
        const newListingItem = await this.findOne(listingItem.Id);
        return newListingItem;
    }

    @validate()
    public async update(id: number, @request(ListingItemUpdateRequest) body: any): Promise<ListingItem> {

        // find the existing one without related
        const listingItem = await this.findOne(id, false);

        // set new values
        listingItem.Hash = body.hash;

        this.log.info('listingItem.toJSON():', listingItem.toJSON());
        // update listingItem record
        const updatedListingItem = await this.listingItemRepo.update(id, listingItem.toJSON());

        // find related record and delete it and recreate related data
        const itemInformation = updatedListingItem.related('ItemInformation').toJSON();
        await this.itemInformationService.destroy(itemInformation.id);
        body.itemInformation.listing_item_id = id;
        await this.itemInformationService.create(body.itemInformation);

        // find related record and delete it and recreate related data
        const paymentInformation = updatedListingItem.related('PaymentInformation').toJSON();
        await this.paymentInformationService.destroy(paymentInformation.id);
        body.paymentInformation.listing_item_id = id;
        await this.paymentInformationService.create(body.paymentInformation);

        // find related record and delete it and recreate related data
        const messagingInformation = updatedListingItem.related('MessagingInformation').toJSON();
        await this.messagingInformationService.destroy(messagingInformation.id);
        body.messagingInformation.listing_item_id = id;
        await this.messagingInformationService.create(body.messagingInformation);

        // finally find and return the updated listingItem
        const newListingItem = await this.findOne(id);
        return newListingItem;

    }

    public async destroy(id: number): Promise<void> {
        await this.listingItemRepo.destroy(id);
    }
}