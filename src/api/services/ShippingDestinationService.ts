import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ShippingDestinationRepository } from '../repositories/ShippingDestinationRepository';
import { ShippingDestination } from '../models/ShippingDestination';
import { ShippingDestinationCreateRequest } from '../requests/ShippingDestinationCreateRequest';
import { ShippingDestinationUpdateRequest } from '../requests/ShippingDestinationUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class ShippingDestinationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ShippingDestinationRepository) public shippingDestinationRepo: ShippingDestinationRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ShippingDestination>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<ShippingDestination>> {
        return this.shippingDestinationRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ShippingDestination> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShippingDestination> {
        const shippingDestination = await this.shippingDestinationRepo.findOne(id, withRelated);
        if (shippingDestination === null) {
            this.log.warn(`ShippingDestination with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return shippingDestination;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ShippingDestination> {
        return this.create({
            country: data.params[0],
            shippingAvailability: data.params[1]
        });
    }

    @validate()
    public async create( @request(ShippingDestinationCreateRequest) body: any): Promise<ShippingDestination> {

        // If the request body was valid we will create the shippingDestination
        const shippingDestination = await this.shippingDestinationRepo.create(body);

        // finally find and return the created shippingDestination
        const newShippingDestination = await this.findOne(shippingDestination.id);
        return newShippingDestination;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ShippingDestination> {
        return this.update(data.params[0], {
            country: data.params[1],
            shippingAvailability: data.params[2]
        });
    }

    @validate()
    public async update(id: number, @request(ShippingDestinationUpdateRequest) body: any): Promise<ShippingDestination> {

        // find the existing one without related
        const shippingDestination = await this.findOne(id, false);

        // set new values
        shippingDestination.Country = body.country;
        shippingDestination.ShippingAvailability = body.shippingAvailability;

        // update shippingDestination record
        const updatedShippingDestination = await this.shippingDestinationRepo.update(id, shippingDestination.toJSON());
        return updatedShippingDestination;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.shippingDestinationRepo.destroy(id);
    }

}
