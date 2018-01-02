import {Code, Debugger, DebuggerFactory, MessageMethodDefinition, Metadata} from 'grpc-web-client';
import {Message} from 'google-protobuf';

export const TimingDebuggerFactory: DebuggerFactory = (requestId: number) => new TimingDebugger(requestId);

class TimingDebugger implements Debugger {
  private id: number;
  private messageIndex: number = 0;
  private requestStart: number;

  constructor(id: number) {
    this.id = id;
  }

  onRequestStart(host: string, method: MessageMethodDefinition): void {
    this.requestStart = Date.now()
  }

  onRequestHeaders(headers: Metadata): void {
    console.log(`Request ${this.id} took ${this.elapsed()}ms to receive request headers`);
  }

  onRequestMessage(payload: Message): void {
    console.log(`Request ${this.id} took ${this.elapsed()}ms to send request message`);
  }

  onResponseHeaders(headers: Metadata, httpStatus: number): void {
    console.log(`Request ${this.id} took ${this.elapsed()}ms to receive response headers`);
  }

  onResponseMessage(payload: Message): void {
    console.log(`Request ${this.id} took ${this.elapsed()} ms to receive message no. ${this.messageIndex}`);
    this.messageIndex++;
  }

  onResponseTrailers(metadata: Metadata): void {
    console.log(`Request ${this.id} took ${this.elapsed()}ms to receive trailers`);
  }

  onResponseEnd(grpcStatus: Code, err: null | Error): void {
    console.log(`Request ${this.id} took ${this.elapsed()}ms to completion`);
  }

  private elapsed(): number {
    return Date.now() - this.requestStart;
  }

}
