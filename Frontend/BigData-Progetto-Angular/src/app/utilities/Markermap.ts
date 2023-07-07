export interface MarkerMap {
    TweetID: number;
    geo: GeoLocation;
    Date: Date;
    Category: string;
  }
export interface GeoLocation {
  coordinates:[number,number];
  type:string;
}

