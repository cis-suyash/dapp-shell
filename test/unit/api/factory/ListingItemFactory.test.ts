import { LogMock } from '../../lib/LogMock';
import { ListingItemFactory } from '../../../../src/api/factories/ListingItemFactory';
import { MessagingProtocolType } from '../../../../src/api/enums/MessagingProtocolType';
import { Currency } from '../../../../src/api/enums/Currency';
import { EscrowType } from '../../../../src/api/enums/EscrowType';

describe('ListingItemFactory', () => {

    let req;
    let listingItemFactory;
    beforeEach(() => {

        listingItemFactory = new ListingItemFactory(LogMock);
        req = {
            itemInformation: {
                title: 'Title of the item',
                short_description: 'A short description / summary of item',
                long_description: 'A longer description of the item or service',
                itemCategory: 1
            },
            paymentInformation: {
                type: 'SALE',
                escrow: {
                    type: EscrowType.NOP
                },
                itemPrice: { currency: Currency.BITCOIN, basePrice: 100000000 }
            },
            messagingInformation: [{ protocol: MessagingProtocolType.SMSG, publicKey: 'publickey2' }],
            listingItemObjects: {}
        };
    });

    test('Should get the listing-item data', () => {
        listingItemFactory.getMessage(req).then((res, error) => {
            expect(res.hash).not.toBeNull();
            // itemInformation
            expect(res.itemInformation).not.toBe(undefined);
            expect(res.itemInformation.title).toBe(req.information.title);
            expect(res.itemInformation.shortDescription).toBe(req.information.short_description);
            expect(res.itemInformation.longDescription).toBe(req.information.long_description);

            expect(res.itemInformation.itemCategory).not.toBe(undefined);
            expect(res.itemInformation.itemCategory.id).not.toBe(undefined);
            expect(res.itemInformation.itemCategory.id).not.toBeNaN();

            // paymentInformation
            expect(res.paymentInformation).not.toBe(undefined);
            expect(res.paymentInformation.type).toBe(req.payment.type);
            expect(res.paymentInformation.escrow.type).toBe(req.payment.escrow.type);
            const itemPrice = res.paymentInformation.itemPrice;
            expect(itemPrice.currency).toBe(req.payment.itemPrice.currency);
            expect(itemPrice.basePrice).toBe(req.payment.itemPrice.basePrice);

            // messagingInformation
            expect(res.messagingInformation).not.toBe(undefined);
            const messagingInformation = res.messagingInformation[0];
            expect(messagingInformation.protocol).toBe(req.messaging[0].protocol);
            expect(messagingInformation.publicKey).toBe(req.messaging[0].publicKey);
        });
    });
});
