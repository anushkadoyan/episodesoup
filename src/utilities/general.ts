export const isObjectPopulated = (someObject: any) => {
  return someObject && Object.keys(someObject)?.length;
};
