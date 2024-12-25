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

export async function getCurrentUser() {
  try {
    const response = await fetch('/api/user/current', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const user = await response.json();
      console.log('Logged-in user:', user);
      return user;
    } else {
      console.error('Failed to fetch user info:', await response.text());
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
  }
}

export async function fetchUserById(userId) {
  try {
    const response = await fetch(`/api/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const user = await response.json();
      console.log('Fetched user:', user);
      return user;
    } else {
      console.error('Failed to fetch user:', await response.text());
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}