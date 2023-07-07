package org.application.disastrinaturali

import org.apache.logging.log4j.scala.Logging
import org.apache.spark.sql.functions.{array, array_contains, avg, coalesce, col, collect_list, count, date_trunc, desc, explode, first, greatest, lit, lower, max, regexp_replace, struct, substring, to_date, to_timestamp, udf, when}
import org.apache.spark.sql.types.{DateType, DoubleType, LongType, StringType, StructType, TimestampType}
import org.apache.spark.sql.{DataFrame, Row, SparkSession}
import org.apache.spark.ml.feature.{IndexToString, RegexTokenizer, StopWordsRemover, Tokenizer}
import org.apache.spark.ml.tuning.CrossValidatorModel
import org.apache.spark.storage.StorageLevel
import utilities.TweetTextCleaner


import scala.math._
import java.sql.Timestamp
import scala.annotation.unused


object QueryManager extends Logging {
  private var sparkSession: SparkSession = _
  private var dataFrame: DataFrame = _
  private var model: CrossValidatorModel = _
  private val path_classification: String = "F:\\Progetto_BigData\\DataSet\\harvey_data_2017_aidr_classification.txt"
  private val path_dataset: String = "F:\\Progetto_BigData\\DataSet\\002"
  private val schema_classification: StructType = new StructType()
    .add("TweetID", LongType, nullable = false)
    .add("Date", TimestampType, nullable = true)
    .add("AIDRLabel", StringType, nullable = true)
    .add("AIDRConfidence", DoubleType, nullable = true)
  private val availableCategoryOfTweets: Array[String] = Array("injured_or_dead_people",
    "relevant_information", "caution_and_advice", "displaced_and_evacuations",
    "sympathy_and_support", "response_efforts", "infrastructure_and_utilities_damage",
    "personal", "affected_individual", "not_related_or_irrelevant", "missing_and_found_people",
    "donation_and_volunteering")


  def init(): Unit = {

    sparkSession = SparkSession
      .builder()
      .appName("Scala Spark - DisastriNaturali")
      .master("local[*]")
      .config("spark.sql.legacy.timeParserPolicy", "LEGACY")
      .config("spark.local.dir", "F:\\tmp-spark")
      .getOrCreate()

    model = CrossValidatorModel.load("path/to/model_f1")

    var df1: DataFrame = sparkSession.read
      .options(Map(
        "multiline" -> "false",
        "inferSchema" -> "true"
      ))
      .json(path_dataset)
      .drop(col("aidr"), col("contributors"), col("display_text_range"), col("filter_level"), col("in_reply_to_screen_name"),
        col("in_reply_to_status_id"), col("in_reply_to_status_id_str"), col("in_reply_to_user_id"), col("in_reply_to_user_id_str"), col("possibly_sensitive"), col("withheld_in_countries"), col("source"),
        col("retweeted"), col("quote_count"), col("place"), col("favorited"))
      //.filter(col("_corrupt_record").isNull).drop(col("_corrupt_record")) // 1 Corrupted Record in dataset 001
      .withColumn("id",col("id").cast(LongType))


    df1.printSchema()


    //"eee MMM dd HH:mm:ss ZZZZ yyyy" "EEE MMM dd HH:mm:ss Z yyyy
    val df2: DataFrame = sparkSession.read
      .options(Map(
        "delimiter" -> "\t",
        "header" -> "true",
        "timestampFormat" -> "EEE MMM dd HH:mm:ss Z yyyy"
      ))
      .schema(schema_classification)
      .csv(path_classification)

    df2.printSchema()

    logger.info("Replacing Text With Full Text")
    df1=replaceTruncatedTextWithFullText(df1)
    logger.info("Finding Distinct Values of AIDRLabel...")
    df2.dropDuplicates("AIDRLabel").select("AIDRLabel").show(false)
    logger.info("Distinct Values of AIDRLabel")
    logger.info("Starting Inner Join DF1 DF2")


    var UncategorizedTweets: DataFrame = df1.join(df2, df1("id") === df2("TweetID"), "leftanti")
    //val number_of_records_UT=UncategorizedTweets.count()

    //logger.info("Tweet non categorizzati: "+number_of_records_UT.toString)
    UncategorizedTweets=categorizeUncategorizedTweets(UncategorizedTweets) //Tweet non categorizzati: 001 404 002 365

    dataFrame= df1.join(df2, df1("id") === df2("TweetID"), "inner")
      //.unionByName(UncategorizedTweets)
      .dropDuplicates()
      .persist(StorageLevel.MEMORY_AND_DISK)

    //val number_of_records=dataFrame.count()
    //logger.info("Tweet Totali: "+number_of_records.toString) //1348157 Dataset 001 950906 002 365


    dataFrame.printSchema()
    dataFrame.show(20, truncate = false)



  }

  /** Spazio Query */
  private def replaceTruncatedTextWithFullText(curr_dataFrame: DataFrame): DataFrame = {
    val updatedDF=
      curr_dataFrame.withColumn("text", when(col("truncated") === true, col("extended_tweet.full_text")).otherwise(col("text")))
    return updatedDF
  }

  private def categorizeUncategorizedTweets(curr_dataFrame:DataFrame):DataFrame={
    val timestampFormat = "EEE MMM dd HH:mm:ss Z yyyy"

    val updatedDF=model.bestModel.transform(curr_dataFrame)
      .drop("cleaned_text","words","filtered_words","raw_features",
        "features","prediction","rawPrediction","probability")
      .withColumn("TweetID",col("id").cast(LongType))
      .withColumn("Date",to_timestamp(col("created_at"), timestampFormat))
      .withColumnRenamed("predictedLabel","AIDRLabel")
      .withColumn("AIDRLabel",col("AIDRLabel").cast(StringType))
      .withColumn("AIDRConfidence",lit(null).cast(DoubleType))

    updatedDF
  }


  /*
    Query di supporto
   */
  def getAllGEOAndTweetID: Array[String] = {
    val res = dataFrame
      .select("TweetID", "geo", "AIDRLabel")
      .filter("geo is not null")
      .toJSON
    res.collect()
  }

  def getTweetByTweetID(tweetID: Long): Array[String] = {
    logger.info(tweetID.toString)
    val res = dataFrame
      .filter(col("TweetID") === tweetID)
      .toJSON

    res.collect()
  }


  /** 1. Query
   * Restituire la geo localizzazione dei tweet filtrando per data/ora e per topic d'interesse,
   * Mostrare il plot sul Front-End */
  def getGeoByDateAndTopic(topic: String, timestampInMillis_start: Long, timestampInMillis_end: Long): Array[String] = {
    val timestamp_start = new Timestamp(timestampInMillis_start)
    val timestamp_end = new Timestamp(timestampInMillis_end)


    val res = dataFrame
      .select("TweetID", "geo", "Date", "AIDRLabel")
      .filter(col("geo").isNotNull)
      .filter(col("AIDRLabel") === topic &&
        col("Date") >= timestamp_start && col("Date") <= timestamp_end)
      .withColumnRenamed("AIDRLabel", "Category")
      .toJSON

    res.collect()
  }

  /**
   * 2. Query
   * Restituisce i primi 10 tweet più commentati in base alla categoria selezionata, altimenti in base a tutte
   *
   */

  def top10MostCommentedTweets(selectedTopic: String): Array[String] = {

    var filteredDF = dataFrame
    if (selectedTopic != "All") {
      filteredDF = filteredDF.filter(col("AIDRLabel") === selectedTopic)
    }

    val res = filteredDF
      .select("is_quote_status", "quoted_status_id", "quoted_status")
      .filter(col("is_quote_status") === true)
      .groupBy("quoted_status_id")
      .agg(count("quoted_status_id").as("reply_count"), first("quoted_status").as("quoted_status"))
      .orderBy(desc("reply_count"))
      .limit(10)
      .toJSON

    res.collect()
  }

  /** 3. Query
   * Restituire la distribuzione dei tweet per ogni giorno con informazioni riguardanti la % dei topic d'interesse
   * ROW: DATA CATEGORIA1 CATEGORIA2 .... CATEGORIA10 TOTALI
   * 10%       30%
   *
   *
   * Istogramma contenente tutti i giorni e per ogni giorno un grafico a torta avente la % dei topic dìinteresse
   * rispetto al totale
   * */
  def getDistributionOfTweetsByDay(timestampInMillis_start: Long, timestampInMillis_end: Long): Array[String] = {
    // utilizziamo una variabile per contenere i nomi delle categorie
    val categoryNames = availableCategoryOfTweets
    //Creazione lista di funzioni per evitare di inserirle manualmente
    val categoryColumns = categoryNames.map(name => count(when(col("AIDRLabel") === name, 1)).as(name))

    val timestamp_start = new Timestamp(timestampInMillis_start)
    val timestamp_end = new Timestamp(timestampInMillis_end)

    val res = dataFrame
      .select(date_trunc("day", col("Date")).as("Day"), col("AIDRLabel"))
      .filter(col("Day") >= timestamp_start && col("Day") <= timestamp_end)
      .groupBy("Day")
      .agg(count(col("AIDRLabel")).as("Total"), categoryColumns.toList: _*)
      .withColumnRenamed("count", "Percentage")
      .withColumnRenamed("AIDRLabel", "Category")
      .orderBy("Day")
      .toJSON

    res.collect()
  }


  /** 4. Query
   * Restituire i primi 10 utenti che hanno twettato di più visualizzando i termini di interesse [Il topic che hanno twettato di più]
   * nome, immagine di profilo e biografia */
  def getNUserWithMostOfTweet(n: Int, selectedCateogoriesOfTweets: Array[String]): Array[String] = {


    val categoryColumns = selectedCateogoriesOfTweets.map(category => col(category))
    val max_topic_nameExpr = coalesce(
      selectedCateogoriesOfTweets.map(category => when(greatest(categoryColumns: _*) === col(category), category).otherwise(null)): _*
    ) //per restituire il primo valore non nullo tra le espressioni passate come argomento



    val filteredDF = dataFrame
      .filter(col("AIDRLabel").isin(selectedCateogoriesOfTweets: _*))


    val TopUserIDTweetsCount = filteredDF
      .groupBy("user.id").count()
      .select("id", "count")
      .orderBy(desc("count")).limit(n)
      .collect()
      .map(_.getAs[Long]("id"))
      .toList


    val users = dataFrame
      .select("user", "Date")
      .orderBy(desc("Date")) //l'ultimo tweet di quell'utente mantiene le informazioni più aggiornate dell'utente
      .select("user.*")
      .filter(col("id").isin(TopUserIDTweetsCount: _*))
      .dropDuplicates("id")
      .select(struct("*").alias("user"))

    val res = filteredDF
      .select("user", "AIDRLabel", "AIDRConfidence")
      .groupBy("user.id")
      .agg(
        count(col("AIDRLabel")).as("Total"),
        selectedCateogoriesOfTweets.map(name =>
          array(
            count(when(col("AIDRLabel") === name, 1)), avg(when(col("AIDRLabel") === name, col("AIDRConfidence")))
          ).as(name)): _*
      )
      .withColumn("max_topic_value", greatest(categoryColumns: _*))
      .withColumn("max_topic_name", max_topic_nameExpr)
      .join(users, col("id") === users("user.id"), "inner")
      .orderBy(desc("Total"))
      .toJSON


    res.collect()
  }

  /** 5. Query
   * Restituisce gli hashtag più popolari correlate a un Topic
   * */
  def getFirstNHashtag(n: Integer, selectedTopicsOfTweets: Array[String]): Array[String] = {

    val hashtagDF = dataFrame.select("AIDRLabel", "entities")
      .filter(col("AIDRLabel").isin(selectedTopicsOfTweets: _*))
      .selectExpr("transform(entities.hashtags,x -> upper(x.text)) as hashtags_vector", "AIDRLabel")

    val expandedDF = hashtagDF.select(col("AIDRLabel"), explode(col("hashtags_vector")).alias("hashtag"))

    val res = expandedDF
      .groupBy("hashtag")
      .agg(
        count(col("AIDRLabel")).as("Total"),
        selectedTopicsOfTweets.map(name =>
          count(when(col("AIDRLabel") === name, 1)).as(name)): _*
      )
      .orderBy(desc("Total"))
      .limit(n)
      .toJSON

    res.collect()
  }

  /** 6. Query
   * Restituisce le menzioni più ricorrenti
   *
   */
  def getFirstNMention(n: Integer, selectedTopicsOfTweets: Array[String]): Array[String] = {
    var tempDF = dataFrame.select("AIDRLabel", "entities")
      .filter(col("AIDRLabel").isin(selectedTopicsOfTweets: _*))
      .selectExpr("transform(entities.user_mentions,x -> (x.name,x.screen_name)) as user_mentions_vector", "AIDRLabel")

    val expandedDF = tempDF.select(col("AIDRLabel"), explode(col("user_mentions_vector")).alias("user_mentions"))

    val res = expandedDF
      .groupBy("user_mentions")
      .agg(
        count(col("AIDRLabel")).as("Total"),
        selectedTopicsOfTweets.map(name =>
          count(when(col("AIDRLabel") === name, 1)).as(name)): _*
      )
      .orderBy(desc("Total"))
      .limit(n)
      .toJSON


    res.collect()
  }

  /** 7. Query
   * Restituire la distribuzione degli hashtag (Selezionabili dal Front-End) durante un intervallo di tempo */
  def getDistributionOfTop10HashtagByDay(timestampInMillis_start: Long, timestampInMillis_end: Long): Array[String] = {
    val n = 10 //Top N hashtag
    val categoryNames = availableCategoryOfTweets
    val categoryColumns = categoryNames.map(name => col(name))
    val countCategoryColumns = categoryNames.map(name => count(when(col("AIDRLabel") === name, 1)).as(name))

    val timestamp_start = new Timestamp(timestampInMillis_start)
    val timestamp_end = new Timestamp(timestampInMillis_end)

    val hashtagDF = dataFrame
      .selectExpr("transform(entities.hashtags,x -> upper(x.text)) as hashtags_vector", "date_trunc('day', Date) as Day", "AIDRLabel")
      .filter(col("Day") >= timestamp_start && col("Day") <= timestamp_end)
      .select(explode(col("hashtags_vector")).alias("hashtag"), col("Day"), col("AIDRLabel"))

    val top_10_hashtag = hashtagDF
      .groupBy("hashtag").count()
      .orderBy(desc("count")).limit(n)
      .collect()
      .map(_.getAs[String]("hashtag"))
      .toList

    val res = hashtagDF
      .filter(col("hashtag").isin(top_10_hashtag: _*))
      .groupBy("hashtag", "Day")
      .agg(count(col("AIDRLabel")).as("Total"), countCategoryColumns.toList: _*)
      .orderBy("Day")
      .groupBy("hashtag")
      .agg(collect_list(struct(
        (categoryColumns :+ col("Day") :+ col("Total")).toList: _*
      )).as("info")
      )
      .toJSON


    res.collect()
  }

  /**
   * Query 8
   * Restituire le prime n parole più utilizzate nel testo per ogni topic
   */
  def getTopNWordsByTopic(selectedTopicsOfTweets: Array[String], n: Int): Array[String] = {

    val filteredByTopic_Df = dataFrame
      .filter(col("AIDRLabel").isin(selectedTopicsOfTweets: _*))
    //Regex per rimuove link,emoji e caratteri speciali
    val regex = "(?i)\\B@\\w+\\b|\\B#\\w+\\b|https?://\\S+|[\\p{So}\\p{Cntrl}\\n\\p{Punct}]+|RT|[^\\\\x00-\\\\x7F]+"

    val cleaned_textDF = filteredByTopic_Df
      .withColumn("clean_text", lower(regexp_replace(col("text"), regex, " ")))

    val tokenizer = new RegexTokenizer()
      .setInputCol("clean_text")
      .setOutputCol("words")
      .setPattern("\\W+")

    val tokenizedDF = tokenizer.transform(cleaned_textDF)

    val remover = new StopWordsRemover()
      .setInputCol("words")
      .setOutputCol("vector_of_filtered_words")

    val filteredDF = remover.transform(tokenizedDF)

    val res = filteredDF
      .select(col("AIDRLabel"), explode(col("vector_of_filtered_words")).alias("words"))
      .groupBy("words")
      .agg(
        count(col("AIDRLabel")).as("Total"),
        selectedTopicsOfTweets.map(name =>
          count(when(col("AIDRLabel") === name, 1)).as(name)): _*
      )
      .orderBy(desc("Total"))
      .limit(n)
      .toJSON

    res.collect()
  }


  /** 9. Query
   * Determinare i tweed pubblicati a distanza r km dal punto di riferimento dato.
   *
   * */
  def getTweetsIDNearestRFromP(P: (Double, Double), r: Double): Array[String] = {

    val haversineUDF = udf((P2: Array[Double]) => {
      haversine(P, P2) <= r
    })

    val res = dataFrame
      .select("TweetID", "geo", "AIDRLabel", "Date")
      .filter("geo is not null")
      //Distanza Euclidea
      //.filter(expr(s"sqrt(pow(geo.coordinates[0] - ${P._1}, 2) + pow(geo.coordinates[1] - ${P._2}, 2))") <= r)
      .filter(haversineUDF(col("geo.coordinates")))
      .withColumnRenamed("AIDRLabel", "Category")
      .toJSON
    res.collect()
  }


  // Definizione della funzione di distanza in km utilizzando la formula di Haversine
  private def haversine(P1: (Double, Double), P2: Array[Double]): Double = {
    val lat1: Double = P1._1
    val lon1: Double = P1._2
    val lat2: Double = P2(0)
    val lon2: Double = P2(1)
    val R = 6371 // Raggio della Terra in km
    val dLat = toRadians(lat2 - lat1)
    val dLon = toRadians(lon2 - lon1)
    val a = sin(dLat / 2) * sin(dLat / 2) +
      cos(toRadians(lat1)) * cos(toRadians(lat2)) *
        sin(dLon / 2) * sin(dLon / 2)
    val c = 2 * atan2(sqrt(a), sqrt(1 - a))
    R * c
  }


  def classifyByText(text: String): Array[String] = {
    // Creazione del dataframe di nuovi tweet da classificare
    val schema = new StructType()
      .add("text", StringType, nullable = false)
    val data = Seq(
      Row(text)
    )

    val df = sparkSession.createDataFrame(sparkSession.sparkContext.parallelize(data), schema)

    // Applicazione del modello
    val predictions = model.bestModel.transform(df)
      .select(col("text"), col("predictedLabel"))
      .toJSON

    return predictions.collect()

  }


}
