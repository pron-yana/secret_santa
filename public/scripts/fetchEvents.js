export async function fetchEvents() {
  try {
    const response = await fetch('/api/event/list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const events = await response.json();
      console.log('Fetched events:', events);
      return events;
    } else {
      console.error('Failed to fetch events:', await response.text());
      return [];
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}
