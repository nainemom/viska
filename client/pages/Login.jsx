import { useCallback } from "preact/hooks"
import { useServer } from "../services/server.jsx";

export default function Login() {
  const [_, connectToServer] = useServer();

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    connectToServer(event.target.passprase.value, event.target.access_key.value);
  }, []);


  return (
    <form onSubmit={ handleSubmit }>
      <div>
        <input name="access_key" placeholder="Server Access Key" />
      </div>
      <div>
        <textarea name="passprase" placeholder="Passprase"></textarea>
      </div>
      <div>
        <button type="submit">Login</button>
      </div>
    </form>
  )
}
