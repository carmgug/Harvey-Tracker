package org.application.disastrinaturali

import org.apache.spark.ml.classification.NaiveBayes
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator
import org.apache.spark.ml.feature._
import org.apache.spark.ml.param.ParamMap
import org.apache.spark.ml.tuning.{CrossValidator, CrossValidatorModel, ParamGridBuilder}
import org.apache.spark.ml.Pipeline
import org.apache.spark.sql.functions.{col, when}
import org.apache.spark.sql.types._
import org.apache.spark.sql.{DataFrame, SparkSession}
import utilities.TweetTextCleaner

object PredictiveModel extends App {

  // Creazione della sessione Spark
  private var sparkSession: SparkSession = _
  private var dataset: DataFrame = _
  private val path_classification: String = "F:\\Progetto_BigData\\DataSet\\harvey_data_2017_aidr_classification.txt"
  private val path_dataset: String = "F:\\Progetto_BigData\\DataSet\\Dataset_Modello"
  private val schema_classification: StructType = new StructType()
    .add("TweetID", LongType, nullable = false)
    .add("Date", TimestampType, nullable = true)
    .add("AIDRLabel", StringType, nullable = true)
    .add("AIDRConfidence", DoubleType, nullable = true)

  private val availableCategoryOfTweets: Array[String] = Array("injured_or_dead_people",
    "relevant_information", "caution_and_advice", "displaced_and_evacuations",
    "sympathy_and_support", "response_efforts", "infrastructure_and_utilities_damage",
    "personal", "affected_individual", "not_related_or_irrelevant", "missing_and_found_people",
    "donation_and_volunteering").sorted(Ordering[String].reverse)
  private val model_path="path/to/model_f1" //path salvataggio modello
  init()


  def init(): Unit = {

    sparkSession = SparkSession
      .builder()
      .appName("Scala Spark - DisastriNaturali")
      .master("local[*]")
      .config("spark.local.dir", "F:\\tmp-spark")
      .getOrCreate()

    // Caricamento del dataset
    val df1: DataFrame = sparkSession.read
      .options(Map(
        "multiline" -> "false",
        "inferSchema" -> "true"
      ))
      .json(path_dataset)


    df1.printSchema()
    df1.show(2, truncate = false)


    val df2: DataFrame = sparkSession.read
      .options(Map(
        "delimiter" -> "\t",
        "header" -> "true",
        "timestampFormat" -> "eee MMM dd HH:mm:ss ZZZZ yyyy"
      ))
      .schema(schema_classification)
      .csv(path_classification)
    df2.printSchema()

    dataset = df1.join(df2, df1("id") === df2("TweetID"), "inner")
      .withColumn("text", when(col("truncated") === true, col("extended_tweet.full_text")).otherwise(col("text")))
      .select("text", "AIDRLabel")
      .cache()

    dataset.show(5, truncate = false)


    // Preprocessing dei dati
    val cleaner = new TweetTextCleaner("TweetTextCleaner")
      .setInputCol("text")
      .setOutputCol("cleaned_text")
    val tokenizer: RegexTokenizer = new RegexTokenizer()
      .setInputCol("cleaned_text")
      .setOutputCol("words")
      .setPattern("\\W+")
    val remover: StopWordsRemover = new StopWordsRemover()
      .setInputCol("words")
      .setOutputCol("filtered_words")
    val hashingTF: HashingTF = new HashingTF()
      .setInputCol("filtered_words")
      .setOutputCol("raw_features")
      .setNumFeatures(5000)
    val idf: IDF = new IDF()
      .setInputCol("raw_features")
      .setOutputCol("features")
    val labelIndexer: StringIndexer = new StringIndexer()
      .setInputCol("AIDRLabel")
      .setOutputCol("label")
      .setStringOrderType("alphabetDesc")
    val labelConverter = new IndexToString()
      .setInputCol("prediction")
      .setOutputCol("predictedLabel")
      .setLabels(availableCategoryOfTweets)

    // Divisione del dataset
    val Array(trainingData, testData) = dataset.randomSplit(Array(0.8, 0.1))

    // Creazione del modello Naive Bayes
    val nb = new NaiveBayes()


    // Creazione del pipeline
    val pipeline: Pipeline = new Pipeline()
      .setStages(Array(cleaner, tokenizer, remover, hashingTF, idf, labelIndexer, nb, labelConverter))

    // Definizione della griglia dei parametri per il cross-validation
    val paramGrid: Array[ParamMap] = new ParamGridBuilder()
      .addGrid(hashingTF.numFeatures, Array(10000, 50000))
      .addGrid(nb.smoothing, Array(0.1, 1.0))
      .build()

    val evaluator_cross: MulticlassClassificationEvaluator = new MulticlassClassificationEvaluator()
      .setLabelCol("label")
      .setPredictionCol("prediction")
      .setMetricName("f1")
    // Creazione del cross-validator
    val cv: CrossValidator = new CrossValidator()
      .setEstimator(pipeline)
      .setEvaluator(evaluator_cross)
      .setEstimatorParamMaps(paramGrid)
      .setNumFolds(5)


    // Addestramento del modello
    val model: CrossValidatorModel = cv.fit(trainingData)

    val evaluator: MulticlassClassificationEvaluator = new MulticlassClassificationEvaluator()
      .setLabelCol("label")
      .setPredictionCol("prediction")


    // Valutazione del modello sul test set
    val testPredictions: DataFrame = model.transform(testData)

    val testAccuracy = evaluator.setMetricName("accuracy").evaluate(testPredictions)

    // Calcolo della precision
    val testPrecision = evaluator.setMetricName("weightedPrecision").evaluate(testPredictions)

    // Calcolo della recall
    val testRecall = evaluator.setMetricName("weightedRecall").evaluate(testPredictions)
    val testF1Score = evaluator.setMetricName("f1").evaluate(testPredictions)


    println(s"Test Accuracy: $testAccuracy")
    println(s"Test Precision: $testPrecision")
    println(s"Test Recall: $testRecall")
    println(s"Test F1 Score:$testF1Score")


    // Salvataggio del modello
    model.save(model_path)


    println(s"Test Accuracy: $testAccuracy")
    println(s"Test Precision: $testPrecision")
    println(s"Test Recall: $testRecall")
    println(s"Test F1 Score:$testF1Score")


  }
}



