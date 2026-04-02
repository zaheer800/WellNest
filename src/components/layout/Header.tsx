import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

const BackArrow: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  rightElement,
}) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-md mx-auto flex items-center px-4 py-3 h-14">
        {/* Left slot */}
        <div className="w-10 flex items-center">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              aria-label="Go back"
            >
              <BackArrow />
            </button>
          )}
        </div>

        {/* Center title */}
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 truncate px-2">
          {title}
        </h1>

        {/* Right slot */}
        <div className="w-10 flex items-center justify-end">
          {rightElement ?? null}
        </div>
      </div>
    </header>
  );
};

export default Header;
