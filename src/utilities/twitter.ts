export const getTwitterUrl = (
  showName: string,
  fromDate: string,
  tilDate: string
) => {
  const baseUrl = "https://twitter.com/search?f=top";
  const showNameNoSpaces = showName.replace(/\s/g, "");
  const showNameAcronym = showName
    .split(/\s/)
    .reduce(
      (response: string, word: string) => (response += word.slice(0, 1)),
      ""
    );
  const query =
    showName.split(" ")?.length > 2
      ? encodeURIComponent(`(${showNameNoSpaces} OR ${showNameAcronym})`)
      : showNameNoSpaces;
  const url = `${baseUrl}&q=${query}%20until%3A${tilDate}%20since%3A${fromDate}&src=typed_query`;
  return url;
  // https://twitter.com/search?f=top&q=bojack%20until%3A2019-09-30%20since%3A2019-09-02&src=typed_query
};
