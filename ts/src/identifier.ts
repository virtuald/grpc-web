// requestId is a global counter used as RequestId
// Each request increments the ID to have the ability to join callbacks together
let requestId: RequestId = 1;

export type RequestId = number;

export function createRequestId(): RequestId {
    requestId += 1;
    return requestId;
}