export default function Header({ title, endChildren, startChildren }) {
  return (
    <header className="h-14 flex flex-row items-center p-4 bg-gray-600 text-white shadow-md">
      <div>
        { startChildren }
      </div>
      <h2 className="flex-grow font-bold text-xl">{ title }</h2>
      <div>
        { endChildren }
      </div>
    </header>
  )
}
