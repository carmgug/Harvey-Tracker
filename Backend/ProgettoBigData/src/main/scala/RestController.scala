package org.application.disastrinaturali


import akka.http.scaladsl.server.Directives._
import ch.megard.akka.http.cors.scaladsl.CorsDirectives.cors
import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.Behaviors
import akka.http.scaladsl.Http
import akka.http.scaladsl.server._
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport
import org.apache.logging.log4j.scala.Logging
import utilities._


import akka.http.scaladsl.model.RemoteAddress

import java.util.Date









object RestController extends FailFastCirceSupport with Logging {
  import io.circe.generic.auto._ //implicit encoders/decoders

  implicit val system: ActorSystem[Nothing] = ActorSystem(Behaviors.empty, "RestController")
  private val interface: String = "192.168.1.45"
  private val port: Int = 8080


  // Definisci le tue rotte

  /*
    Query Di supporto
   */


  private val getAllGEOAndTweetID: Route = cors(){
      (path("getAllGEOAndTweetID") & get) {
            complete(
              ResponseResults[Array[String]]("All geo tweet", System.currentTimeMillis(), QueryManager.getAllGEOAndTweetID)
            )
      }
  }

  private val getTweetByTweetID: Route = cors() {
    (path("getTweetByTweetID") & get) {
      parameters(Symbol("TweetID").as[Long]) {
        tweetID =>
          complete(
            ResponseResults[Array[String]]("Tweet", System.currentTimeMillis(), QueryManager.getTweetByTweetID(tweetID))
          )
      }
    }
  }






  /* Query 1. */
  private val getGeoByDateAndTopic : Route = cors() {
    (path("getGeoByDateAndTopic") & get) {
      parameters(Symbol("date_in").as[Long],Symbol("date_fin").as[Long], Symbol("topic").as[String]) {
        (d_in,d_fin, t) =>
          complete(
            ResponseResults[Array[String]]("GeoLocation Tweet by date and topic", System.currentTimeMillis(), QueryManager.getGeoByDateAndTopic(t, d_in,d_fin))
          )
      }
    }
  }

  /* Query 2. */
  private val getMostTweetCommentato : Route =cors(){
    (path("getMostTweetCommentato") & get) {
      parameters(Symbol("selected_topic").as[String]) {
        (t) =>
          complete(
            ResponseResults[Array[String]]("Most comment by topic", System.currentTimeMillis(), QueryManager.top10MostCommentedTweets(t))
          )
      }
    }
  }

  /* Query 3. */
  private val getDistributionOfTweetsByDay : Route = cors() {
    (path("getDistributionOfTweetsByDay") & get) {
      parameters(Symbol("date_in").as[Long],Symbol("date_fin").as[Long]) {
        (tsp_start,tsp_end)=>
          complete(
          ResponseResults[Array[String]]("Distribution of Tweets per day",System.currentTimeMillis(),QueryManager.getDistributionOfTweetsByDay(tsp_start,tsp_end))
        )
      }

    }
  }

  /*Query 4 */
  private val getNUserWithMostOfTweet : Route = cors() {
    (path("getNUserWithMostOfTweet") & get) {
      parameters(Symbol("n").as[Int],Symbol("selectedCateogoriesOfTweets").as[Array[String]]){
        (n,selectedCategories)=> complete(
          ResponseResults[Array[String]]("Top "+n+"Users",System.currentTimeMillis(),QueryManager.getNUserWithMostOfTweet(n,selectedCategories ))
        )
      }
    }
  }

  /*Query 5 */
  private val getFirstNHashtag: Route = cors() {
    (path("getFirstNHashtag") & get) {
      parameters(Symbol("n").as[Int], Symbol("selected_topics").as[Array[String]]) {
        (n, topics) =>
          complete(
            ResponseResults[Array[String]]("Top " + n.toString + "Hashtags", System.currentTimeMillis(), QueryManager.getFirstNHashtag(n, topics))
          )
      }
    }
  }

  /*Query 6 */
  private val getFirstNMention: Route = cors() {
    (path("getFirstNMention") & get) {
      parameters(Symbol("n").as[Int], Symbol("selected_topics").as[Array[String]]) {
        (n, topics) =>
          complete(
            ResponseResults[Array[String]]("Top " + n.toString + "Mention", System.currentTimeMillis(), QueryManager.getFirstNMention(n, topics))
          )
      }
    }
  }

  /*Query 7 */
  private val getDistributionOfTop10HashtagByDay: Route = cors() {
    (path("getDistributionOfTop10HashtagByDay") & get) {
      parameters( Symbol("timestamp_start").as[Long],Symbol("timestamp_end").as[Long]) {
        (tsp_start,tsp_end) =>
          complete(
            ResponseResults[Array[String]](
              "Distribution of top 10 hashtag in ["+(new Date(tsp_start))+","+new Date(tsp_end)+"]",
              System.currentTimeMillis(),
              QueryManager.getDistributionOfTop10HashtagByDay(tsp_start,tsp_end)
            )
          )
      }

    }
  }


  /*
    /* Query 8 */
   */
  private val getTopNWordsByTopic: Route = cors() {
    (path("getTopNWordsByTopic") & get) {
      parameters(Symbol("selected_topics").as[Array[String]],Symbol("n").as[Int]){
        (st,n) =>
          complete(
            ResponseResults[Array[String]](
              "Top "+n+" Words by topic: "+st,
              System.currentTimeMillis(),
              QueryManager.getTopNWordsByTopic(st,n)
            )
          )
      }
    }
  }

  /*
    Query 9
   */
  private val getAllGEOAndTweetIDNearestP: Route = cors() {
    (path("getAllGEOAndTweetIDNearestP") & get) {
      parameters(Symbol("latitude").as[Double], Symbol("longitude").as[Double], Symbol("r").as[Double]) {
        (lat, long, r) =>
          complete(
            ResponseResults[Array[String]](
              "Tweets that are at most " + r + " from the point: (" + lat + "," + long + ")",
              System.currentTimeMillis(),
              QueryManager.getTweetsIDNearestRFromP((lat, long), r))
          )
      }
    }
  }
  /*
  Query 10
   */
  private val classifyByText:Route=cors(){
    (path("classifyByText") & get) {
      parameters(Symbol("text").as[String]) {
        (text) =>
          complete(
            ResponseResults[Array[String]](
              "Classification Complete",
              System.currentTimeMillis(),
              QueryManager.classifyByText(text))
          )
      }
    }
  }

  private def routes: Route = {
    concat(getAllGEOAndTweetID,getTweetByTweetID,getAllGEOAndTweetIDNearestP,
      getGeoByDateAndTopic,getDistributionOfTweetsByDay,
      getNUserWithMostOfTweet,getFirstNMention,getFirstNHashtag,getMostTweetCommentato,
      getTopNWordsByTopic,getDistributionOfTop10HashtagByDay,classifyByText)
  }



  def main():Unit ={
    Http().newServerAt(interface, port).bind(routes)
    logger.info("Successfully started 'RestController' on "+interface+":"+port)

  }
}

//domain model

