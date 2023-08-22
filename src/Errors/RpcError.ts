export default class RpcError extends Error {
  json: any;

  constructor(json: any) {
    if (
      json.error &&
      json.error.details &&
      json.error.details.length &&
      json.error.details[0].message
    ) {
      super(json.error.details[0].message);
    } else if (
      json.processed &&
      json.processed.except &&
      json.processed.except.message
    ) {
      super(json.processed.except.message);
    } else {
      super(json.message);
    }

    this.json = json;
  }
}
