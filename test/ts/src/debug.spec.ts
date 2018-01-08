import {ConsoleDebugger} from "../../../ts/src";
import * as debug from "../../../ts/src/debug";
import * as sinon from "sinon";
import {assert} from "chai";
import {TestService} from "../_proto/improbable/grpcweb/test/test_pb_service";
import {BrowserHeaders as Metadata} from "browser-headers";


describe("ConsoleDebugger", () => {

  const REQUEST_ID = 123;
  const HTTP_STATUS = 200;
  const dbg = new ConsoleDebugger(REQUEST_ID);
  let debugSpy: sinon.SinonSpy;

  beforeEach(() => {
    debugSpy = sinon.spy(debug, 'debug');
  });
  afterEach(() => (debug.debug as any).restore());

  it('should log onRequestStart', () => {
    const host = "http://test.host";
    const method = TestService.Ping
    const msg = `gRPC-Web #${REQUEST_ID}: Making request to ${host} for ${method.service.serviceName}.${method.methodName}`;

    dbg.onRequestStart(host, method);

    assert.isTrue(debugSpy.calledWith(msg));
  });

  it('should log onRequestHeaders', () => {
    const headers = new Metadata();
    headers.set('Content-Type', 'application/grpc-web');

    dbg.onRequestHeaders(headers);
    assert.isTrue(debugSpy.calledWith(`gRPC-Web #${this.id}: Headers:`, headers));
  });

});
