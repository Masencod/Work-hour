import { userTypes } from "../../custom";

export default function NavBar({
  user,
  loggedIn,
  login,
  logout,
}: {
  user: userTypes;
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
}) {
  return (
    <nav className="bg-black flex justify-between items-center px-5 py-2">
      <div className="flex gap-x-2">
        {loggedIn && (
          <button
            className="transition-all bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => logout()}
          >
            logout
          </button>
        )}
        <button
          className="transition-all bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => login()}
        >
          {loggedIn
            ? `${user?.user_metadata?.full_name}`
            : `damn boi u need to log in`}
        </button>
      </div>
      <div className="">
        <p className="text-white font-bold">Work Hour</p>
      </div>
    </nav>
  );
}
