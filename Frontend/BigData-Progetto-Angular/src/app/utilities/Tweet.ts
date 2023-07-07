import { User } from "./User";

export interface Tweet{
    user: User;
    text: String;
    entities: any;
    favorite_count: Number;
    retweet_count: Number;
    reply_count: Number;
    created_at:Date;
    quoted_status_id:Number;
    quoted_status: Tweet;
}
