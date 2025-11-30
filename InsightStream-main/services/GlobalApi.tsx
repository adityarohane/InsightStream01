export const RunStatus = async (eventId: string) => {
  const response = await fetch(`/api/run-status?eventId=${eventId}`);
  const json = await response.json();
  return json;
};
