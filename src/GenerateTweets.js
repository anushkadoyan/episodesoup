import { Button, Icon } from "semantic-ui-react";
import { getTwitterUrl } from "./utilities/twitter";
import moment from "moment";

function GenerateTweets(props) {
  const { selectedShow, selectedEpisode, validInfo } = props;

  const handleClick = () => {
    const { airdate } = selectedEpisode;
    // TODO
    // narrow down by air time, not just date
    // https://twittercommunity.com/t/how-to-find-tweets-posted-at-a-specific-time/148323/2
    const nextDay = moment(selectedEpisode.airdate)
      ?.add(1, "day")
      .format("YYYY-MM-DD");
    const url = getTwitterUrl(selectedShow.label, airdate, nextDay);
    window.open(url, "_blank");
  };

  return (
    <Button
      color="twitter"
      onClick={handleClick}
      disabled={!validInfo}
      size="mini"
    >
      <Icon name="twitter" /> Twitter
    </Button>
    // <Button onClick={handleClick} disabled={!validInfo} color="blue">
    //   Tweets
    // </Button>
  );
}

export default GenerateTweets;
