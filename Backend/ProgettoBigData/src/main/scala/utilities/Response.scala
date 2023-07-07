package org.application.disastrinaturali
package utilities

import scala.annotation.unused


trait Response {
  def message: String
  def timestamp: Long
}
@unused
case class ResponseMessage(message:String,timestamp:Long) extends Response
case class ResponseResults[T]( message:String,timestamp:Long,data: T) extends  Response
