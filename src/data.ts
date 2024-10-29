export type EventType = {
  title: string;
  category: 'Art' | 'Music' | 'Theatre';
  venue: string;
  start: string;
  end: string;
};

export async function getEvent(title: string) {
  return (await getEvents('', '')).find((event) => event.title === title)!;
}

export async function getRecentEvents() {
  return (await getEvents('', '')).slice(0, 10);
}

export async function getEvents(category: string, filter: string) {
  const events = [
    // Art
    {
      title: 'Anna Weyant / Who’s Afraid of the Big Bad Wolves?',
      venue: 'Gagosian, Davies Street',
      start: '2024-10-08T00:00:00.000Z',
      end: '2024-12-20T00:00:00.000Z',
      category: 'Art',
    },
    {
      title: 'Jonas Wood',
      venue: 'Gagosian, Grosvenor Hill',
      start: '2024-10-07T00:00:00.000Z',
      end: '2024-11-23T00:00:00.000Z',
      category: 'Art',
    },
    {
      title: 'Michael Craig-Martin',
      venue: 'Royal Academy of Arts',
      start: '2024-09-21T00:00:00.000Z',
      end: '2025-12-10T00:00:00.000Z',
      category: 'Art',
    },
    {
      title: 'The Walls Between Us',
      venue: 'Saatchi Gallery',
      start: '2024-10-17T00:00:00.000Z',
      end: '2024-11-25T00:00:00.000Z',
      category: 'Art',
    },
    {
      title: 'Turner Prize 2024',
      venue: 'Tate Britain',
      start: '2024-09-25T00:00:00.000Z',
      end: '2025-02-16T00:00:00.000Z',
      category: 'Art',
    },
    {
      title: 'Mike Kelley / Ghost and Spirit',
      venue: 'Tate Modern',
      start: '2024-10-03T00:00:00.000Z',
      end: '2025-03-09T00:00:00.000Z',
      category: 'Art',
    },
    {
      title: 'Yayoi Kusama / Every Day I Pray For Love',
      venue: 'Victoria Miro',
      start: '2024-09-25T00:00:00.000Z',
      end: '2025-11-02T00:00:00.000Z',
      category: 'Art',
    },
    {
      title: 'Tracey Emin / I Followed You To The End',
      venue: 'White Cube, Bermondsey',
      start: '2024-09-19T00:00:00.000Z',
      end: '2024-11-10T00:00:00.000Z',
      category: 'Art',
    },
    {
      title: 'Danh Vo',
      venue: 'White Cube, Mason’s Yard',
      start: '2024-10-11T00:00:00.000Z',
      end: '2024-11-16T00:00:00.000Z',
      category: 'Art',
    },
    {
      title: 'Lygia Clark & Sonia Boyce',
      venue: 'Whitechapel Gallery',
      start: '2024-10-02T00:00:00.000Z',
      end: '2025-01-12T00:00:00.000Z',
      category: 'Art',
    },
    {
      title: 'Dominique White / Deadweight',
      venue: 'Whitechapel Gallery',
      start: '2024-07-02T00:00:00.000Z',
      end: '2024-09-15T00:00:00.000Z',
      category: 'Art',
    },
    // Music
    {
      title: 'Royal Philharmonic Orchestra',
      venue: 'Cadogan Hall',
      start: '2024-10-30T19:30:00.000Z',
      end: '2024-10-30T22:00:00.000Z',
      category: 'Music',
    },
    {
      title: 'Soft Play',
      venue: 'O2 Arena',
      start: '2024-10-31T00:00:00.000Z',
      end: '2024-11-01T00:00:00.000Z',
      category: 'Music',
    },
    {
      title: 'Kasabian',
      venue: 'O2 Brixton Academy',
      start: '2024-11-15T00:00:00.000Z',
      end: '2024-11-16T00:00:00.000Z',
      category: 'Music',
    },
    {
      title: 'The Libertines',
      venue: 'Roundhouse',
      start: '2024-10-30T19:00:00.000Z',
      end: '2024-10-30T23:00:00.000Z',
      category: 'Music',
    },
    {
      title: 'The Libertines',
      venue: 'Roundhouse',
      start: '2024-10-31T19:00:00.000Z',
      end: '2024-10-31T23:00:00.000Z',
      category: 'Music',
    },
    {
      title: 'The Libertines',
      venue: 'Roundhouse',
      start: '2024-11-01T19:00:00.000Z',
      end: '2024-11-01T23:00:00.000Z',
      category: 'Music',
    },
    {
      title: 'Avatar Live in Concert',
      venue: 'Royal Albert Hall',
      start: '2024-10-27T12:00:00.000Z',
      end: '2024-10-28T12:00:00.000Z',
      category: 'Music',
    },

    // Theatre
    {
      title: 'Guys & Dolls',
      venue: 'Bridge Theatre',
      start: '2023-03-14T00:00:00.000Z',
      end: '2025-01-04T00:00:00.000Z',
      category: 'Theatre',
    },
    {
      title: 'Punchdrunk / Viola’s Room',
      venue: 'The Carriageworks',
      start: '2024-05-14T00:00:00.000Z',
      end: '2024-12-23T00:00:00.000Z',
      category: 'Theatre',
    },
    {
      title: 'The Fear Of 13',
      venue: 'Donmar Warehouse',
      start: '2024-10-28T00:00:00.000Z',
      end: '2024-11-30T00:00:00.000Z',
      category: 'Theatre',
    },
    {
      title: 'Operation Mincemeat',
      venue: 'Fortune Theatre',
      start: '2023-03-29T00:00:00.000Z',
      end: '2030-01-01T00:00:00.000Z',
      category: 'Theatre',
    },
    {
      title: 'The Phantom of the Opera',
      venue: 'Her Majesty’s Theatre',
      start: '1986-09-10T00:00:00.000Z',
      end: '2030-01-01T00:00:00.000Z',
      category: 'Theatre',
    },
    {
      title: 'The Lion King',
      venue: 'Lyceum Theatre',
      start: '1999-10-09T00:00:00.000Z',
      end: '2030-01-01T00:00:00.000Z',
      category: 'Theatre',
    },
    {
      title: 'Coriolanus',
      venue: 'National Theatre',
      start: '2024-09-24T00:00:00.000Z',
      end: '2024-11-09T00:00:00.000Z',
      category: 'Theatre',
    },
    {
      title: 'The Book of Mormon',
      venue: 'Prince of Wales Theatre',
      start: '2013-03-21T00:00:00.000Z',
      end: '2030-01-01T00:00:00.000Z',
      category: 'Theatre',
    },
    {
      title: 'Les Misérables',
      venue: 'Sondheim Theatre',
      start: '1985-10-08T00:00:00.000Z',
      end: '2030-01-01T00:00:00.000Z',
      category: 'Theatre',
    },
    {
      title: 'The Mousetrap',
      venue: 'St. Martin’s Theatre',
      start: '1952-11-25T00:00:00.000Z',
      end: '2030-01-01T00:00:00.000Z',
      category: 'Theatre',
    },
  ];

  return events.filter((event) => {
    const matchesCategory = category ? event.category === category : true;
    const matchesFilter = filter
      ? event.title.toLowerCase().includes(filter.toLowerCase()) ||
        event.venue.toLowerCase().includes(filter.toLowerCase())
      : true;
    return matchesCategory && matchesFilter;
  });
}
