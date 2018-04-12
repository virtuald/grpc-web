import {Metadata} from "./metadata";
import {ProtobufMessage} from "./message";
import {Code} from "./Code";
import {MethodDefinition} from "./service";
import {ClientRpcOptions} from "./client";
import {RequestId} from "./identifier";

// Middleware enables user defined handlers to perform a side effect
// such as timing, error reporting or debugging
// All registered middlewares will be executed on each request
export interface Middleware {
    // onCreate is invoked exactly once when a request is constructed
    onCreate?: (id: RequestId, methodDescriptor: MethodDefinition<ProtobufMessage, ProtobufMessage>, properties: ClientRpcOptions) => void;

    // onStart is invoked exactly once when a request starts to be executed
    onStart?: (id: RequestId, headers: Metadata) => void;
    // onSend is invoked multiple times when the client sends a message
    onSend?: (id: RequestId, message: ProtobufMessage) => void;

    // onHeaders is invoked exactly once when response headers become available
    onHeaders?: (id: RequestId, headers: Metadata) => void;
    // onMessage is invoked once for each proto message received
    onMessage?: (id: RequestId, message: ProtobufMessage) => void;
    // onFinishSend is invoked exactly once when a client indicates it wants to close the request
    onFinishSend?: (id: RequestId) => void;
    // onEnd is invoked exactly once when the request is completed
    onEnd?: (id: RequestId, code: Code, message: string, trailers: Metadata) => void;

    // onClose is invoked exactly once when the client chooses to abort the request
    onClose?: (id: RequestId,) => void;

    // onError is invoked each time an error is encountered
    onError?: (id: RequestId, err: Error) => void;
}

// No middlewares are active by default
const middlewares: Middleware[] = [];

export function registerMiddleware(middleware: Middleware) {
    middlewares.push(middleware)
}

export function removeMiddleware(middleware: Middleware) {
    const index = middlewares.indexOf(middleware)
    if (index < 0) {
        return
    }
    middlewares.splice(index, 1)
}

// MiddlewareDispatcher is a singleton which attempts to dispatch a callback to all registered middlewares.
// Middlewares will receive the callback in the order they are registered in.
export class MiddlewareDispatcher {

    static onCreate(id: RequestId, methodDescriptor: MethodDefinition<ProtobufMessage, ProtobufMessage>, props: ClientRpcOptions) {
        middlewares.forEach(m => m.onCreate && m.onCreate(id, methodDescriptor, props));
    }

    static onStart(id: RequestId, headers: Metadata) {
        middlewares.forEach(m => m.onStart && m.onStart(id, headers))
    }

    static onHeaders(id: RequestId, headers: Metadata) {
        middlewares.forEach(m => {
            m.onHeaders && m.onHeaders(id, headers);
        })
    }

    static onSend(id: RequestId, message: ProtobufMessage) {
        middlewares.forEach(m => {
            m.onSend && m.onSend(id, message);
        })
    }

    static onFinishSend(id: RequestId) {
        middlewares.forEach(m => {
            m.onFinishSend && m.onFinishSend(id);
        })
    }

    static onEnd(id: RequestId, code: Code, message: string, trailers: Metadata) {
        middlewares.forEach(m => {
            m.onEnd && m.onEnd(id, code, message, trailers);
        })
    }

    static onClose(id: RequestId) {
        middlewares.forEach(m => m.onClose && m.onClose(id));
    }

    static onError(id: RequestId, err: Error) {
        middlewares.forEach(m => {
            m.onError && m.onError(id, err);
        })
    }
}
