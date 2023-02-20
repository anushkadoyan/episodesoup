import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Dimmer,
  Divider,
  Header,
  Icon,
  Label,
  List,
  Loader,
  Segment,
} from "semantic-ui-react";
import moment from "moment-timezone";
import { useTvApi } from "./requests";
import { isObjectPopulated } from "./utilities/general";
import { redditBaseURLNoForwardSlash } from "./requests/constants";
import _ from "lodash";
import GenerateTweets from "./GenerateTweets";
// import "moment-timezone";

function GenerateReddits(props) {
  const {
    selectedSeason,
    selectedEpisode,
    selectedShow,
    validInfo,
    setReddits,
    goBack,
  } = props;
  const { getSubreddits, getRedditPosts } = useTvApi();
  const { airdate } = selectedEpisode;
  const startStamp = moment
    .tz(airdate, "UTC")
    // TODO let user select +/- 1/2 days
    .subtract(2, "days")
    .startOf("day")
    .format("X");
  const endStamp = moment.tz(airdate, "UTC").endOf("day").format("X");

  const [subreddits, setSubreddits] = useState([]);
  const [selectedSubreddit, setSelectedSubreddit] = useState({});
  const [subredditsLoading, setSubredditsLoading] = useState({});

  const [relevantPosts, setRelevantPosts] = useState([]);
  const [relevantPostsLoading, setRelevantPostsLoading] = useState(false);

  const encodedShowName = useMemo(
    () => encodeURIComponent(selectedShow.label),
    [selectedShow]
  );

  /**
   * returns S01E04, S1E4, S1 E4, 01x04, Season 1 Episode 4
   */
  const seasonEpisodeNumOptions = useMemo(() => {
    const { index: episodeNum } = selectedEpisode;
    const { index: seasonNum } = selectedSeason;
    const sznNumWithZero = seasonNum > 9 ? seasonNum : `0${seasonNum}`;
    const episodeNumWithZero = episodeNum > 9 ? episodeNum : `0${episodeNum}`;
    return [
      `S${sznNumWithZero}E${episodeNumWithZero}`,
      `${sznNumWithZero}x${episodeNumWithZero}`,
      `S${seasonNum}E${episodeNum}`,
      `S${seasonNum} E${episodeNum}`,
      `S${seasonNum} Ep${episodeNum}`,
      `Season ${seasonNum} Episode ${episodeNum}`,
      `S${sznNumWithZero}E${episodeNumWithZero}`,
    ];
  }, [selectedSeason, selectedEpisode]);

  useEffect(() => {
    getRelevantSubreddits();
  }, [selectedEpisode]);

  const getRelevantSubreddits = async (selectedEpisode) => {
    // TODO get timezone of episode, probably with a more specific search on episode pick
    // reddit timestamps are UTC

    setSubredditsLoading(true);
    const subreddits = await getSubreddits(encodedShowName);
    setSubreddits(
      subreddits.data.children.map((item, i) => {
        // if (i < 5) {
        return {
          url: item.data.url,
          title: item.data.title,
          subscribers: item.data.subscribers,
          description: item.data.public_description,
        };
        // }
      })
    );
    setSubredditsLoading(false);

    // window.open(url, "_blank");
  };

  const handleSubredditSelected = async (selectedSubreddit) => {
    setSelectedSubreddit(selectedSubreddit);
    setRelevantPostsLoading(true);
    // assume it's the most subscribed out of the first 2,
    // TODO let user choose
    // const selectedSubreddit = subreddits?.data?.children
    //   ?.slice(0, 2)
    //   ?.reduce((prev, current) => {
    //     return prev.y > current.y ? prev : current;
    //   });

    let relevantPosts = [];
    let relevantPosts1 = [];
    let relevantPosts2 = [];

    let triedTimes = 0;
    const queryAttempts = [
      ...seasonEpisodeNumOptions,
      `Episode ${selectedEpisode.index}`,
      selectedEpisode.rawLabel,
      "discussion",
      "",
    ];

    // try quering for different types of posts on air date, most specific first
    while (!relevantPosts?.length && triedTimes < queryAttempts.length) {
      relevantPosts = await getRedditPosts(
        selectedSubreddit.url.slice(3, -1),
        endStamp,
        startStamp,
        queryAttempts[triedTimes]
      );
      relevantPosts = relevantPosts?.data;

      triedTimes++;
    }

    // if no luck, try querying season&episode info with no timestamps
    let triedTimesWithoutTimestamp = 0;
    if (!relevantPosts?.length || relevantPosts?.length < 3) {
      while (
        !relevantPosts1?.length &&
        triedTimesWithoutTimestamp < seasonEpisodeNumOptions.length
      ) {
        relevantPosts1 = await getRedditPosts(
          selectedSubreddit.url.slice(3, -1),
          null,
          null,
          seasonEpisodeNumOptions[triedTimesWithoutTimestamp]
        );
        relevantPosts1 = relevantPosts1?.data;

        triedTimesWithoutTimestamp++;
      }
    }

    // if no luck, try querying season&episode info with no timestamps with Reddit API
    let triedTimesWithRedditAPI = 0;
    if (!relevantPosts2?.length || relevantPosts2?.length < 3) {
      while (
        !relevantPosts2?.length &&
        triedTimesWithRedditAPI < seasonEpisodeNumOptions.length
      ) {
        relevantPosts2 = await getRedditPosts(
          selectedSubreddit.url.slice(3, -1),
          null,
          null,
          seasonEpisodeNumOptions[triedTimesWithRedditAPI],
          true
        );
        relevantPosts2 = relevantPosts2?.data?.children;

        triedTimesWithRedditAPI++;
      }
    }

    let allRelevantPosts = [
      ...relevantPosts,
      ...relevantPosts1,
      ...relevantPosts2,
    ]?.reduce((acc, post) => {
      acc.push({
        date: post?.utc_datetime_str || post?.data?.utc_datetime_str,
        title: post?.title || post?.data?.title,
        url: `${redditBaseURLNoForwardSlash}/${(
          post?.permalink || post?.data?.permalink
        )?.slice(1)}`,
        numComments: post?.num_comments || post?.data?.num_comments,
        flairText: post?.link_flair_text || post?.data?.link_flair_text,
      });
      return acc;
    }, []);

    allRelevantPosts = _.orderBy(allRelevantPosts, "numComments", "desc");

    setRelevantPosts(allRelevantPosts);
    setRelevantPostsLoading(false);
  };

  const kFormatter = (num) => {
    return Math.abs(num) > 999
      ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k"
      : Math.sign(num) * Math.abs(num);
  };

  const handlePostClicked = (URL) => {
    window.open(URL, "_blank");
  };

  return (
    <Card fluid className="episodeInfo">
      <Card.Content>
        <Card.Header
          content={
            <div className="flexBetween">
              <span>{selectedEpisode.rawLabel}</span>
              <span className="editEpisode pointer">
                <Icon name="pencil" size="small" onClick={goBack} />
              </span>
            </div>
          }
        />

        <Card.Meta content={`${selectedShow.label}, ${selectedSeason.label}`} />
      </Card.Content>
      <Card.Content>
        <Card.Description className="episodeDescription">
          {subreddits && (
            <>
              <Segment className="twitterSection" basic>
                <Header as="h5">Click to see relevant tweets:</Header>
                <GenerateTweets
                  validInfo={validInfo}
                  selectedShow={selectedShow}
                  selectedEpisode={selectedEpisode}
                />
                <Divider section />

                {!isObjectPopulated(selectedSubreddit) ? (
                  <Header as="h5">
                    Click a subreddit to see relevant posts:
                  </Header>
                ) : relevantPosts?.length ? (
                  <p
                    onClick={() => {
                      setSelectedSubreddit({});
                      setRelevantPosts([]);
                    }}
                    className="pointer"
                  >
                    <Icon name={"arrow left"} /> <span>Back to subreddits</span>
                  </p>
                ) : null}
                <List>
                  {subredditsLoading ? (
                    <Loader active inline="centered" />
                  ) : !isObjectPopulated(selectedSubreddit) ? (
                    subreddits.map((r) => (
                      <List.Item
                        className="pointer"
                        onClick={() => handleSubredditSelected(r)}
                      >
                        <List.Content>
                          <List.Header>
                            {r.title}
                            <span>
                              <small className="members">{`${kFormatter(
                                r.subscribers
                              )} Members`}</small>
                            </span>
                          </List.Header>
                          <List.Description>
                            <small>{r.description}</small>
                          </List.Description>
                        </List.Content>
                      </List.Item>
                    ))
                  ) : !relevantPostsLoading ? (
                    relevantPosts?.length ? (
                      relevantPosts.map((post) => {
                        return (
                          <List.Item
                            as="a"
                            onClick={() => handlePostClicked(post.url)}
                            className="pointer"
                          >
                            <List.Content>
                              {/* TODO figure out how to display flair nicely */}
                              {/* {!!post.flairText && (
                              <Label color="teal">{post.flairText}</Label>
                            )} */}
                              <List.Header>{post.title}</List.Header>

                              <List.Description>
                                <small>{`${
                                  post.numComments ?? "Hidden # of"
                                } Comments`}</small>
                              </List.Description>
                            </List.Content>
                          </List.Item>
                        );
                      })
                    ) : (
                      <>
                        <p
                          onClick={() => {
                            setSelectedSubreddit({});
                            setRelevantPosts([]);
                          }}
                          className="pointer"
                        >
                          <Icon name={"arrow left"} />{" "}
                          <span>Back to subreddits</span>
                        </p>
                        <p>no relevant posts :(</p>
                      </>
                    )
                  ) : (
                    <Loader active inline="centered" />
                  )}
                </List>
              </Segment>
            </>
          )}
        </Card.Description>
      </Card.Content>
    </Card>
  );
}

export default GenerateReddits;
