import React, { useCallback, useMemo, useState } from "react";
import debounce from "debounce";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { useTvApi } from "./requests";
import { Grid } from "semantic-ui-react";
import GenerateTweets from "./GenerateTweets";
import { isObjectPopulated } from "./utilities/general";

export default function MainContent() {
  const { getShows, getSeasons, getEpisodes } = useTvApi();
  const [inputVal, setInputVal] = useState("");
  const [inputSave, setSave] = useState("");

  const [selectedShow, setSelectedShow] = useState({});
  const [selectedSeason, setSelectedSeason] = useState({});
  const [selectedEpisode, setSelectedEpisode] = useState({});
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const mapShowsToDropdownElements = (options) => {
    return options.map((option) => ({
      value: option.id,
      label: option.name,
    }));
  };

  const mapSeasonsToDropdownElements = (options) => {
    return options.map((option) => ({
      value: option.id,
      label: `Season ${option.number}`,
    }));
  };

  const mapEpisodesToDropdownElements = (options) => {
    return options.map((option) => ({
      value: option.id,
      label: option.name,
      airdate: option.airdate,
    }));
  };

  const debounceLoadOptions = useCallback(
    debounce((inputText, callback, localInput) => {
      // console.log("here", inputText, localInput);
      if (!callback || typeof callback === "undefined") return;
      const val = inputText?.length ? inputText : localInput;
      getShows(val).then((options) =>
        callback(mapShowsToDropdownElements(options))
      );
    }, 500),
    []
  );
  const handleSelectedShow = (selected) => {
    setSelectedShow(selected);
    setSeasons([]);
    setSelectedSeason({});
    setSelectedEpisode({});
    getSeasons(selected.value).then((resp) => {
      return setSeasons(mapSeasonsToDropdownElements(resp));
    });
  };

  const handleSelectedSeason = (selected) => {
    setSelectedSeason(selected);
    setEpisodes([]);
    setSelectedEpisode({});
    getEpisodes(selected.value).then((resp) => {
      return setEpisodes(mapEpisodesToDropdownElements(resp));
    });
  };

  const handleSelectedEpisode = (selected) => {
    setSelectedEpisode(selected);
  };

  const showSeasons = useMemo(
    () => isObjectPopulated(selectedShow),
    [selectedShow]
  );

  const showEpisodes = useMemo(
    () => isObjectPopulated(selectedShow) && isObjectPopulated(selectedSeason),
    [selectedShow, selectedSeason]
  );

  const showFindButton = useMemo(
    () =>
      isObjectPopulated(selectedShow) &&
      isObjectPopulated(selectedSeason) &&
      isObjectPopulated(selectedEpisode),
    [selectedShow, selectedSeason, selectedEpisode]
  );

  const handleShowChange = (inputValue, { action }) => {
    // console.log("things", inputValue, action);
    if (selectedShow?.label) {
      setSelectedShow({});
    }
    console.log("inputValue", inputValue);
    console.log("inputVal", inputVal);
    console.log("action", action);
    console.log("---------------------------");

    if (
      action !== "set-value" &&
      action !== "menu-close" &&
      action !== "input-blur"
    ) {
      setInputVal(inputValue);
      return inputValue;
    }

    setInputVal(inputVal);
    return inputVal;
  };

  console.log(selectedShow, inputVal);
  return (
    <div>
      <div className="filters">
        <div className="filter">
          <AsyncSelect
            loadOptions={(val, cb) => debounceLoadOptions(val, cb, inputVal)}
            cacheOptions
            name="shows"
            placeholder={selectedShow.label || "What are you watching?"}
            inputValue={selectedShow.label || inputVal}
            onInputChange={handleShowChange}
            onChange={handleSelectedShow}
            onMenuOpen={(val, cb) => debounceLoadOptions(val, cb, inputVal)}
          />
        </div>
        {showSeasons ? (
          <div className="filter">
            <Select
              className="basic-single"
              classNamePrefix="select"
              placeholder="Season..."
              isDisabled={!showSeasons}
              selectValue={selectedSeason}
              isSearchable
              name="seasons"
              options={seasons}
              onChange={handleSelectedSeason}
            />
          </div>
        ) : null}
        {showEpisodes ? (
          <div className="filter">
            <Select
              className="basic-single"
              classNamePrefix="select"
              placeholder="Episode..."
              isDisabled={!showEpisodes}
              isSearchable
              name="episodes"
              options={episodes}
              onChange={handleSelectedEpisode}
            />
          </div>
        ) : null}
      </div>
      {showFindButton ? (
        <GenerateTweets
          selectedShow={selectedShow}
          selectedSeason={selectedSeason}
          selectedEpisode={selectedEpisode}
        />
      ) : null}
    </div>
  );
}
