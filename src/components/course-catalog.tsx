"use client";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { pathways, type Course } from "@/lib/catalog";
import { CourseCard } from "./course-card";
export function CourseCatalog({ courses }: { courses: Course[] }) {
  const [path, setPath] = useState("all"),
    [query, setQuery] = useState(""),
    [level, setLevel] = useState("all");
  const filtered = courses.filter(
    (c) =>
      (path === "all" || c.pathway === path) &&
      (level === "all" || c.level === level) &&
      `${c.title} ${c.subtitle}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="catalog-tools">
        <div
          className="filter-tabs"
          role="group"
          aria-label="Filter by pathway"
        >
          <button
            onClick={() => setPath("all")}
            className={path === "all" ? "selected" : ""}
          >
            All pathways
          </button>
          {pathways
            .filter((p) => p.id !== "athena")
            .map((p) => (
              <button
                key={p.id}
                className={path === p.id ? "selected" : ""}
                onClick={() => setPath(p.id)}
              >
                {p.specialty}
              </button>
            ))}
        </div>
        <label className="search-box">
          <Search size={17} />
          <input
            placeholder="Find your next skill…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search courses"
          />
        </label>
      </div>
      <div className="catalog-count">
        <span>
          {filtered.length} {filtered.length === 1 ? "course" : "courses"} to
          explore
        </span>
        <label>
          <SlidersHorizontal size={14} />
          <select
            aria-label="Filter difficulty"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="all">All levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="course-grid">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>A different path, perhaps?</h3>
          <p>No courses match these filters.</p>
          <button
            className="button button-outline"
            onClick={() => {
              setQuery("");
              setPath("all");
              setLevel("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
