import { Typography } from "@material-tailwind/react";

const SITEMAP = [
  {
    title: "Company",
    links: [
      { name: "About Us", url: "/about" },
      { name: "Careers", url: "/careers" },
      { name: "Our Team", url: "/team" },
      { name: "Projects", url: "/projects" },
    ],
  },
  {
    title: "Help Center",
    links: [
      { name: "Discord", url: "https://discord.com" },
      { name: "Twitter", url: "https://twitter.com" },
      { name: "GitHub", url: "https://github.com" },
      { name: "Contact Us", url: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Blog", url: "/blog" },
      { name: "Newsletter", url: "/newsletter" },
      { name: "Free Products", url: "/free-products" },
      { name: "Affiliate Program", url: "/affiliate" },
    ],
  },
  {
    title: "Products",
    links: [
      { name: "Templates", url: "/templates" },
      { name: "UI Kits", url: "/ui-kits" },
      { name: "Icons", url: "/icons" },
      { name: "Mockups", url: "/mockups" },
    ],
  },
];

const currentYear = new Date().getFullYear();

function Footer() {
  return (
    <footer className="relative  w-full bg-gradient-to-br from-[#090716] to-[#070b33] text-white">
      <div className="relative w-full px-8 mx-auto max-w-7xl">
        {/* Background Circle */}
     
        
        <div className="relative grid w-full grid-cols-1 gap-8 py-12 mx-auto md:grid-cols-2 lg:grid-cols-4">
          {SITEMAP.map(({ title, links }, key) => (
            <div key={key} className="w-full">
              <Typography
                variant="small"
                className="mb-4 font-bold text-yellow-100 uppercase"
              >
                {title}
              </Typography>
              <ul className="space-y-1">
                {links.map(({ name, url }, index) => (
                  <li key={index}>
                    <a
                      href={url}
                      className="inline-block py-1 pr-2 text-gray-200 transition-transform hover:scale-105 hover:text-yellow-300"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full py-4 border-t border-gray-700 md:flex-row md:justify-between">
          <Typography
            variant="small"
            className="mb-4 font-normal text-center text-gray-400 md:mb-0"
          >
            &copy; {currentYear} Your Company. All Rights Reserved.
          </Typography>
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              aria-label="Facebook"
              className="text-gray-200 transition-opacity hover:text-yellow-300"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.99 3.657 9.128 8.437 9.878v-6.99h-2.54v-2.888h2.54V9.797c0-2.51 1.493-3.891 3.776-3.891 1.094 0 2.238.195 2.238.195v2.462h-1.26c-1.24 0-1.627.771-1.627 1.562v1.875h2.773l-.443 2.888h-2.33v6.99C18.344 21.128 22 16.99 22 12z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="text-gray-400 transition-opacity hover:text-yellow-300"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7.75 2C4.678 2 2 4.678 2 7.75v8.5C2 19.322 4.678 22 7.75 22h8.5C19.322 22 22 19.322 22 16.25v-8.5C22 4.678 19.322 2 16.25 2h-8.5zM7 6.5c.828 0 1.5.672 1.5 1.5S7.828 9.5 7 9.5 5.5 8.828 5.5 8s.672-1.5 1.5-1.5zm5 2.25a3.25 3.25 0 110 6.5 3.25 3.25 0 010-6.5zm5.25-.5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              aria-label="Twitter"
              className="text-gray-400 transition-opacity hover:text-yellow-300"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M22.162 5.656c-.799.353-1.657.588-2.55.694a4.548 4.548 0 001.995-2.508 8.906 8.906 0 01-2.882 1.101 4.524 4.524 0 00-7.701 4.127A12.836 12.836 0 013.152 4.58a4.524 4.524 0 001.402 6.034 4.492 4.492 0 01-2.047-.566v.057a4.523 4.523 0 003.629 4.437 4.524 4.524 0 01-2.042.078 4.524 4.524 0 004.223 3.138 9.061 9.061 0 01-5.604 1.933c-.364 0-.722-.021-1.078-.063a12.816 12.816 0 006.927 2.032c8.315 0 12.865-6.89 12.865-12.866 0-.196-.004-.391-.014-.585A9.194 9.194 0 0022.162 5.656z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              aria-label="GitHub"
              className="text-gray-400 transition-opacity hover:text-yellow-300"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2a10 10 0 00-3.162 19.493c.5.092.682-.217.682-.483v-1.688c-2.786.604-3.374-1.343-3.374-1.343-.454-1.15-1.11-1.456-1.11-1.456-.908-.62.068-.608.068-.608 1.004.07 1.532 1.03 1.532 1.03.892 1.529 2.341 1.088 2.91.832.09-.647.35-1.09.637-1.34-2.223-.253-4.555-1.111-4.555-4.943 0-1.095.389-1.988 1.025-2.688-.102-.253-.444-1.272.1-2.653 0 0 .836-.268 2.736 1.025a9.513 9.513 0 012.5-.338 9.504 9.504 0 012.5.338c1.9-1.293 2.735-1.025 2.735-1.025.545 1.381.204 2.4.1 2.653.639.7 1.025 1.593 1.025 2.688 0 3.848-2.337 4.691-4.566 4.941.36.31.678.924.678 1.86v2.756c0 .268.178.58.687.481A10 10 0 0012 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
