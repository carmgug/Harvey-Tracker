ThisBuild / version := "0.1.0-SNAPSHOT"

ThisBuild / scalaVersion := "2.13.8"

val sparkVersion= "3.4.0"



libraryDependencies ++= Seq(
  "org.apache.spark" %% "spark-core" % sparkVersion,
  "org.apache.spark" %% "spark-sql" % sparkVersion,
  "org.apache.spark" %% "spark-mllib" % sparkVersion,
  "org.apache.spark" %% "spark-hive" % sparkVersion,
  "org.apache.logging.log4j" %% "log4j-api-scala" % "12.0",
  "org.apache.logging.log4j" % "log4j-core" % "2.20.0" % Runtime,

  //Akka
  "com.typesafe.akka" %% "akka-actor-typed" % "2.8.0",
  "com.typesafe.akka" %% "akka-stream" % "2.8.0",
  //Circe
  "io.circe" %% "circe-core" % "0.14.5",
  "io.circe" %% "circe-generic" % "0.14.5",
  "io.circe" %% "circe-parser" % "0.14.5",
  //Akka Http + serializers
  "com.typesafe.akka" %% "akka-http" % "10.5.0",
  "com.typesafe.akka" %% "akka-http-spray-json" % "10.5.0",
  "de.heikoseeberger" %% "akka-http-circe" % "1.39.2",
  "ch.megard" %% "akka-http-cors" % "1.2.0"
)


lazy val root = (project in file("."))
  .settings(
    name := "ProgettoBigData",
    idePackagePrefix := Some("org.application.disastrinaturali")
  )


