export async function fetchEvents() {
  try {
    const response = await fetch('/api/event/list', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const events = await response.json();
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
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const user = await response.json();
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
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const user = await response.json();
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

export async function notify(message, type = 'info') {
  return new Promise((resolve) => {
    const notification = document.createElement('div');
    notification.className = `notification-custom ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    const dismiss = () => {
      notification.remove();
      resolve();
    };
    setTimeout(dismiss, 2000);
    notification.addEventListener('click', dismiss);
  });
}
