package org.application.disastrinaturali
package utilities

import org.apache.spark.ml.UnaryTransformer
import org.apache.spark.ml.param.ParamMap
import org.apache.spark.ml.util.{DefaultParamsReadable, DefaultParamsWritable}
import org.apache.spark.sql.types.{DataType, StringType}

class TweetTextCleaner(override val uid: String) extends UnaryTransformer[String, String, TweetTextCleaner] with DefaultParamsWritable {
  val regex = "(?i)\\B@\\w+\\b|\\B#\\w+\\b|https?://\\S+|[\\p{So}\\p{Cntrl}\\n\\p{Punct}]+|RT|[^\\\\x00-\\\\x7F]+"

  override protected def createTransformFunc: String => String = {

    (text: String) => text.replaceAll(regex, " ").toLowerCase()
  }
  override protected def outputDataType: DataType = StringType
  // Implementazione del metodo `copy`
  override def copy(extra: ParamMap): TweetTextCleaner = defaultCopy(extra)
}
//Oggetto Companion
object TweetTextCleaner extends DefaultParamsReadable[TweetTextCleaner] {
  override def load(path: String): TweetTextCleaner = super.load(path)
}

