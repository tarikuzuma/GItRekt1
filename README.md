# HackMatch 🇵🇭

**HackMatch** is a premium, high-fidelity teammate discovery platform designed specifically for students and engineering innovators. It streamlines the process of forming high-performance teams for hackathons and collaborative coding projects through an intuitive "swipe-to-match" interface.

![HackMatch Preview](https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200)

---

## 🚩 The Problem

Student developers and designers in the Philippines often struggle with **"Teammate Friction"**:
*   **Skill Mismatch**: Joining teams that lack the specific technical expertise required for a hackathon.
*   **Communication Gaps**: Finding potential teammates across different universities (UP, DLSU, UST, etc.) is fragmented and difficult.
*   **Discovery Hurdles**: Upcoming local hackathons and their requirements are often scattered across multiple platforms.
*   **Management Overload**: Coordinating tasks and communication once a team is formed is messy without a centralized system.

## 💡 Our Solution

**HackMatch** centralizes the hackathon lifecycle into a single, premium experience. It provides a gesture-driven matching system that prioritizes **technical synergy** and **local context**, ensuring that student builders find their "perfect match" based on proven skills, university affiliation, and project goals.

## ⚙️ How It Works

1.  **Discover**: Browse a curated list of high-stakes hackathons in major Philippine hubs (BGC, Makati, Cebu, Davao).
2.  **Swipe**: Use an intuitive, Tinder-style interface to explore student profiles from top local universities.
3.  **Match**: Connect instantly when both parties express interest.
4.  **Coordinate**: Launch directly into a dedicated team workspace with real-time messaging and objective tracking.

## 🚀 Features

- **Teammate Discovery**: An interactive, gesture-based swipe system (powered by Framer Motion) to find partners based on skill synergy, university, and project interests.
- **Hackathon Explorer**: A curated bento-grid layout of upcoming hackathons in the Philippines (BGC, Makati, Cebu, Davao) with Prize Pools and technical requirements.
- **Integrated Messaging**: A fully functional, real-time messaging interface for team coordination, file sharing, and channel-based discussions.
- **Team Dashboard**: Manage your "Bayanihan" squad, track objectives, and monitor team chemistry through a centralized mission control.
- **Premium Design System**: Built with a modern glassmorphic aesthetic, featuring vibrant purple illumination, ambient glows, and a responsive, dark-mode-first architecture.

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: Material Symbols & Lucide React
- **Localization**: Specialized for the Philippine tech ecosystem (PHP currency, local universities, and cultural context).

## 📦 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/HackMatch.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```text
├── app/               # Next.js App Router (Pages & Logic)
│   ├── discover/      # Hackathon event exploration
│   ├── swipe/         # Teammate matching interface
│   ├── match/         # Match success landing
│   ├── messages/      # Real-time chat system
│   └── dashboard/     # Team management
├── components/        # Reusable UI components
├── public/            # Static assets
└── styles/            # Global styling & Tailwind config
```

## 🌟 Why Your Project Matters

In the rapidly growing Philippine tech ecosystem, the greatest barrier to innovation isn't a lack of talent—it's a **lack of connection**. 

HackMatch empowers the next generation of Pinoy builders to step out of their university silos and form cross-institutional "dream teams." By simplifying the teammate search, we allow students to focus on what truly matters: **building solutions that solve real-world Philippine problems.**

## 🇵🇭 Localization

HackMatch is proudly localized for the Philippine market:
- **Currency**: All prize pools are listed in Philippine Peso (₱).
- **Universities**: Integrated with major institutions like UP, DLSU, UST, ADMU, and Mapua.
- **Language**: Subtle professional Taglish integration for a familiar local experience.

---

Built with 💜 for the next generation of Pinoy builders.
