package org.application.disastrinaturali

import org.apache.logging.log4j.scala.Logging


object SparkApplication extends Logging {

  def main(args : Array[String]): Unit = {
    logger.info("Starting Spark Application ...")
    QueryManager.init()
    RestController.main()
    logger.info("Application and Server http initialized successfully")
  }

}
