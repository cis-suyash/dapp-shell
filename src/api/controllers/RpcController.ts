import { inject, named } from 'inversify';
import { controller, httpPost, response, requestBody } from 'inversify-express-utils';
import { app } from '../../app';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { JsonRpc2Request, RpcErrorCode } from '../../core/api/jsonrpc';
import { JsonRpcError } from '../../core/api/JsonRpcError';
import { ItemCategoryService } from '../services/ItemCategoryService';
import { EscrowService } from '../services/EscrowService';
import { ItemPriceService } from '../services/ItemPriceService';
import { PaymentInformationService } from '../services/PaymentInformationService';
import { ItemImageDataService } from '../services/ItemImageDataService';
import { ItemImageService } from '../services/ItemImageService';
import { LocationMarkerService } from '../services/LocationMarkerService';
import { ItemLocationService } from '../services/ItemLocationService';
import { ShippingDestinationService } from '../services/ShippingDestinationService';
import { ItemInformationService } from '../services/ItemInformationService';
import { MessagingInformationService } from '../services/MessagingInformationService';
import { ListingItemService } from '../services/ListingItemService';

// Get middlewares
const rpc = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RpcMiddleware);
let rpcIdCount = 0;

@controller('/rpc', rpc.use)
export class RpcController {

    public log: LoggerType;
    private VERSION = '2.0';
    private MAX_INT32 = 2147483647;
    private exposedMethods = {};

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Service) @named(Targets.Service.ItemPriceService) private itemPriceService: ItemPriceService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.ItemImageDataService) private imageDataService: ItemImageDataService,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.LocationMarkerService) private locationMarkerService: LocationMarkerService,
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) private itemLocationService: ItemLocationService,
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) private messagingInformationService: MessagingInformationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);

        // expose/"route" the rpc methods here
        // injectedInstanceName.function
        this.exposedMethods = {
            // todo: figure out a working way to pass for example: this.escrowService.create
            //
            'itemcategory.create': 'itemCategoryService.rpcCreate',
            'itemcategory.find': 'itemCategoryService.rpcFindOne',
            'itemcategory.findall': 'itemCategoryService.rpcFindAll',
            'itemcategory.findroot': 'itemCategoryService.rpcFindRoot',
            'itemcategory.update': 'itemCategoryService.rpcUpdate',
            'itemcategory.destroy': 'itemCategoryService.rpcDestroy',
            'escrow.create': 'escrowService.rpcCreate',
            'escrow.find': 'escrowService.rpcFindOne',
            'escrow.findall': 'escrowService.rpcFindAll',
            'escrow.update': 'escrowService.rpcUpdate',
            'escrow.destroy': 'escrowService.rpcDestroy',
            'itemprice.create': 'itemPriceService.rpcCreate',
            'itemprice.find': 'itemPriceService.rpcFindOne',
            'itemprice.findall': 'itemPriceService.rpcFindAll',
            'itemprice.update': 'itemPriceService.rpcUpdate',
            'itemprice.destroy': 'itemPriceService.rpcDestroy',
            'paymentinformation.create': 'paymentInformationService.rpcCreate',
            'paymentinformation.find': 'paymentInformationService.rpcFindOne',
            'paymentinformation.findall': 'paymentInformationService.rpcFindAll',
            'paymentinformation.update': 'paymentInformationService.rpcUpdate',
            'paymentinformation.destroy': 'paymentInformationService.rpcDestroy',
            'itemimagedata.create': 'imageDataService.rpcCreate',
            'itemimagedata.find': 'imageDataService.rpcFindOne',
            'itemimagedata.findall': 'imageDataService.rpcFindAll',
            'itemimagedata.update': 'imageDataService.rpcUpdate',
            'itemimagedata.destroy': 'imageDataService.rpcDestroy',
            'itemimage.create': 'itemImageService.rpcCreate',
            'itemimage.find': 'itemImageService.rpcFindOne',
            'itemimage.findall': 'itemImageService.rpcFindAll',
            'itemimage.update': 'itemImageService.rpcUpdate',
            'itemimage.destroy': 'itemCategoryService.rpcDestroy',
            'locationmarker.create': 'locationMarkerService.rpcCreate',
            'locationmarker.find': 'locationMarkerService.rpcFindOne',
            'locationmarker.findall': 'locationMarkerService.rpcFindAll',
            'locationmarker.update': 'locationMarkerService.rpcUpdate',
            'locationmarker.destroy': 'locationMarkerService.rpcDestroy',
            'itemlocation.create': 'itemLocationService.rpcCreate',
            'itemlocation.find': 'itemLocationService.rpcFindOne',
            'itemlocation.findall': 'itemLocationService.rpcFindAll',
            'itemlocation.update': 'itemLocationService.rpcUpdate',
            'itemlocation.destroy': 'itemLocationService.rpcDestroy',
            'shipping.create': 'shippingDestinationService.rpcCreate',
            'shipping.find': 'shippingDestinationService.rpcFindOne',
            'shipping.findall': 'shippingDestinationService.rpcFindAll',
            'shipping.update': 'shippingDestinationService.rpcUpdate',
            'shipping.destroy': 'shippingDestinationService.rpcDestroy',
            'iteminformation.create': 'itemInformationService.rpcCreate',
            'iteminformation.find': 'itemInformationService.rpcFindOne',
            'iteminformation.findall': 'itemInformationService.rpcFindAll',
            'iteminformation.update': 'itemInformationService.rpcUpdate',
            'iteminformation.destroy': 'itemInformationService.rpcDestroy',
            'messaginginformation.create': 'messagingInformationService.rpcCreate',
            'messaginginformation.find': 'messagingInformationService.rpcFindOne',
            'messaginginformation.findall': 'messagingInformationService.rpcFindAll',
            'messaginginformation.update': 'messagingInformationService.rpcUpdate',
            'messaginginformation.destroy': 'messagingInformationService.rpcDestroy',
            'listingitem.create': 'listingItemService.rpcCreate',
            'listingitem.find': 'listingItemService.rpcFindOne',
            'listingitem.findall': 'listingItemService.rpcFindAll',
            'listingitem.findbycategory': 'listingItemService.rpcFindByCategory',
            'listingitem.update': 'listingItemService.rpcUpdate',
            'listingitem.destroy': 'listingItemService.rpcDestroy'
        };
    }

    @httpPost('/')
    public async handleRPC(@response() res: myExpress.Response, @requestBody() body: any): Promise<any> {

        const rpcRequest = this.createRequest(body.method, body.params);
        this.log.debug('controller.handleRPC() rpcRequest:', JSON.stringify(rpcRequest, null, 2));

        // check that we have exposed the method
        if (this.exposedMethods.hasOwnProperty(body.method)) {

            const callPath = this.exposedMethods[rpcRequest.method].split('.');

            // make sure we have an instance of the service and it contains the function we want to call
            if (this.hasOwnProperty(callPath[0]) && typeof this[callPath[0]][callPath[1]] === 'function') {

                this.log.debug('controller.handleRPC(), CALL: ' + rpcRequest.method + ' -> ' + this.exposedMethods[rpcRequest.method]);
                return this[callPath[0]][callPath[1]](rpcRequest);
            } else {
                return res.failed(400, this.getErrorMessage(RpcErrorCode.InternalError), new JsonRpcError(RpcErrorCode.InternalError,
                    'method: ' + body.method + ' routing failed.'));
            }
        } else {
            // no body.method found -> invalid call
            return res.failed(400, this.getErrorMessage(RpcErrorCode.MethodNotFound), new JsonRpcError(RpcErrorCode.MethodNotFound,
                'method: ' + body.method + ' not found.'));
        }

    }

    private createRequest(method: string, params?: any, id?: string | number): JsonRpc2Request {
        if (id === null || id === undefined) {
            id = this.generateId();
        } else if (typeof (id) !== 'number') {
            id = String(id);
        }
        return { jsonrpc: this.VERSION, method: method.toLowerCase(), params, id };
    }

    private generateId(): number {
        if (rpcIdCount >= this.MAX_INT32) {
            rpcIdCount = 0;
        }
        return ++rpcIdCount;
    }

    private getErrorMessage(code: number): string {
        switch (code) {
            case RpcErrorCode.ParseError:
                return 'Parse error';
            case RpcErrorCode.InvalidRequest:
                return 'Invalid Request';
            case RpcErrorCode.MethodNotFound:
                return 'Method not found';
            case RpcErrorCode.InvalidParams:
                return 'Invalid params';
            case RpcErrorCode.InternalError:
                return 'Internal error';
        }
        return 'Unknown Error';
    }
}
