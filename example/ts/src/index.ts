import {Code, ConsoleDebuggerFactory, grpc, Metadata, registerDebugger} from "grpc-web-client";
import {BookService} from "../_proto/examplecom/library/book_service_pb_service";
import {Book, GetBookRequest, QueryBooksRequest} from "../_proto/examplecom/library/book_service_pb";
import {TimingDebuggerFactory} from './debugger';

declare const USE_TLS: boolean;
const host = USE_TLS ? "https://localhost:9091" : "http://localhost:9090";

registerDebugger(
  ConsoleDebuggerFactory, // comes with grpc-web-client
  TimingDebuggerFactory, // user defined debugger
);

// Construct and invoke a unary gRPC request
function getBook() {
  const getBookRequest = new GetBookRequest();
  getBookRequest.setIsbn(60929871);
  grpc.unary(BookService.GetBook, {
    request: getBookRequest,
    host: host,
    onEnd: res => {
      const {status, message} = res;
      if (status === Code.OK && message) {
        console.log("getBook.onEnd.message", message.toObject());
        writeToElement('get-book', message.toObject());
      }
    }
  });
}

// Construct and invoke a streaming response request
function queryBooks() {
  const queryBooksRequest = new QueryBooksRequest();
  queryBooksRequest.setAuthorPrefix("Geor");

  const books: Book[] = [];
  grpc.invoke(BookService.QueryBooks, {
    request: queryBooksRequest,
    host: host,
    onHeaders: (headers: Metadata) => {
      console.log("queryBooks.onHeaders", headers);
    },
    onMessage: (message: Book) => {
      books.push(message);
      writeToElement('query-books', books.map(b => b.toObject()));
      console.log("queryBooks.onMessage", message.toObject());
    },
    onEnd: (code: Code, msg: string, trailers: Metadata) => {
      console.log("queryBooks.onEnd", code, msg, trailers);
    }
  });
}

function writeToElement(id: string, content: any) {
  const element = document.getElementById(id);
  if (element) {
    element.innerText = JSON.stringify(content, null, '  ');
  }
}

const getBookButton = document.getElementById('go-get-book');
const queryBooksButton = document.getElementById('go-query-books');

if (getBookButton) {
  getBookButton.onclick = () => getBook()
}

if (queryBooksButton) {
  queryBooksButton.onclick = () => queryBooks()
}
