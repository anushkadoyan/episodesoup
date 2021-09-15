import { useMemo } from "react";
import { Button } from "semantic-ui-react";
import { getTwitterUrl } from "./utilities/twitter";
import moment from "moment";

function GenerateTweets(props) {
  const { selectedShow, selectedSeason, selectedEpisode } = props;

  const validInfo = useMemo(() =>
    Object.values(props)?.every(
      (selectedThing) => selectedThing && selectedThing?.value
    )
  );

  const handleClick = () => {
    const { airdate, label } = selectedEpisode;
    const nextDay = moment(selectedEpisode.airdate)
      ?.add(1, "day")
      .format("YYYY-MM-DD");
    console.log(selectedShow);
    const url = getTwitterUrl(selectedShow.label, airdate, nextDay);
    window.open(url, "_blank");
  };

  return (
    <div className="generate-tweets">
      <Button onClick={handleClick} disabled={!validInfo}>
        Find Tweets
      </Button>
    </div>
  );
}

export default GenerateTweets;
