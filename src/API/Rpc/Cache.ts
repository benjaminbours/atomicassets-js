export type AssetRow = any;
export type PresetRow = any;
export type SchemeRow = any;
export type CollectionRow = any;
export type OfferRow = any;

export default class RpcCache {
    private readonly assets: {[id: string]: {data: AssetRow, expiration: number}} = {};
    private readonly presets: {[id: string]: {data: PresetRow, expiration: number}} = {};
    private readonly schemes: {[id: string]: {data: SchemeRow, expiration: number}} = {};
    private readonly collections: {[id: string]: {data: CollectionRow, expiration: number}} = {};
    private readonly offers: {[id: string]: {data: OfferRow, expiration: number}} = {};

    public asset(assetID: string, data?: AssetRow): AssetRow | null {
        return this.access<AssetRow>(assetID, this.assets, data);
    }

    public preset(presetID: number, data?: PresetRow): PresetRow | null {
        return this.access<PresetRow>(presetID, this.presets, data);
    }

    public scheme(scheme: string, data?: SchemeRow): SchemeRow | null {
        return this.access<SchemeRow>(scheme, this.schemes, data);
    }

    public collection(collection: string, data?: CollectionRow): CollectionRow | null {
        return this.access<CollectionRow>(collection, this.collections, data);
    }

    public offer(offerID: string, data?: OfferRow): OfferRow | null {
        return this.access<OfferRow>(offerID, this.offers, data);
    }

    private access<T>(identifier: string | number, cache: {[id: string]: {expiration: number, data: T}}, data?: T): T | null {
        if(data) {
            cache[String(identifier)] = {expiration: Date.now() + 15 * 60 * 1000, data};

            return data;
        }

        if(typeof this.assets[String(identifier)] === "undefined" || this.assets[String(identifier)].expiration >= Date.now()) {
            return null;
        }

        return this.assets[String(identifier)].data;
    }
}