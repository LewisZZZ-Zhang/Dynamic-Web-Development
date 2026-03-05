# Project Documentation: NYC Movie Locations Map

## 1. Research & Inspiration

The project was inspired by the exhibition "This Is New York: 100 Years of the City in Art and Pop Culture" at the Museum of the City of New York, which presented cinema as a layered, spatial experience. Existing film location maps were found to be static, limited, and not community-driven. Additional references included:
- [anitabi.cn/map](http://anitabi.cn/map) (anime pilgrimage mapping)
- [filmingmap.com](https://filmingmap.com/)
- [Rhizome Net Art Anthology](https://anthology.rhizome.org/)
- [Creative Applications](https://www.creativeapplications.net/)
- [linci.co Design Bookmarks](https://bookmarks.linci.co/)
- Social media, Are.na, Notion, Google Docs

Key insight: No platform mapped specific film scenes to real locations with community discussion and moderation.

## 2. Concept

A **community-driven cinematic map of New York City**. Users can:
- Mark specific locations for film scenes (not just whole movies)
- Add details: film, scene timestamp, description, image
- Discuss, upvote/downvote, and moderate entries
- View most popular locations and search by movie

Markers are user-generated and can be removed if downvoted excessively. The platform is designed to grow and self-correct through community input.

## 3. Information Architecture & User Experience

### Sitemap & Page Details
- `/` — **Main Map View**
  - HTML: `index.html`
  - Function: Displays all movie scene markers on an interactive map. Users can click markers to view details. Top navigation buttons for popular, search, add location, and about.
  - Implementation: Uses Leaflet.js to render the map. Frontend fetches marker data from `/points-data` API and displays them. Clicking a marker navigates to `/points/:id`.
- `/popular` — **Most Popular Locations**
  - HTML: `popular.html`
  - Function: Shows locations sorted by votes. Each entry displays location, movie, vote count, and film still. Click to view details.
  - Implementation: Frontend fetches data from `/popular-data` API, sorts by upvotes minus downvotes, and renders the list.
- `/search` — **Search by Movie Name**
  - HTML: `search.html`
  - Function: Users enter a movie name to see all related scene locations. Each result shows location, movie, votes, and image. Click to view details.
  - Implementation: Frontend fetches results from `/search-data?movie=xxx` API and displays them.
- `/add-location` — **Add a New Location**
  - HTML: `add-location.html`
  - Function: Users fill out a form to add a new scene, including location name, movie name, timestamp, image, and description. Map picker for coordinates.
  - Implementation: Leaflet.js map lets users select coordinates. Form submits via POST to `/add-location`, uploading data and image. Backend saves to database and redirects to detail page.
- `/about` — **Project Overview & Community Guidelines**
  - HTML: `about.html`
  - Function: Introduces project goals, community guidelines, and encourages contributions and discussion.
  - Implementation: Static page rendered by HTML.
- `/points/:id` — **Location Detail Page**
  - HTML: `detail.html`
  - Function: Shows details for a single scene: location, movie, timestamp, coordinates, description, image. Supports voting and comments.
  - Implementation: Frontend fetches details from `/points/:id/data` API and renders the page. Voting and comments are submitted via POST requests and update in real time. Includes Google Maps link and search for other scenes from the same movie.

### Wireframes
- **Main Map:** Map with clickable markers, floating controls for navigation
- **Add Location:** Form for details, map picker for coordinates, image upload
- **Detail Page:** Location info, film still, voting, comments section
- **Popular/Search:** List of locations with images, votes, and links to details

Wireframes were sketched digitally and refined in code. The UI is card-based, with clear navigation and feedback.

## 4. Higher Fidelity Design


## 4. Higher Fidelity Design

For the design, I wanted the site to feel like a movie experience, so I chose a dark theme that looks kind of cinematic and modern. The layout uses cards for each location, which helps keep things organized and easy to read. I made sure the site works well on both computers and phones, so it’s responsive and looks good everywhere. For the map, I used custom dark tiles from Leaflet and CARTO to match the overall vibe.

I picked colors that fit the theme: a really dark background (#0f1115), blue accents for buttons and links (#78a6ff), and card backgrounds with subtle borders (#151922, #262b36). For fonts, I stuck with system UI fonts because they’re clear and easy to read, which is important for accessibility.

On the search, popular, detail, and add-location pages, I made sure that labels (like "Location" or "Daily Bugle") are smaller and lighter in color, while the actual content is bigger and more noticeable. This helps users quickly tell apart the labels from the main information and makes the cards and details easier to read.

