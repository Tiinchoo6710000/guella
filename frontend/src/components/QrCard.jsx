
export default function QrCard({ texto }) {
  // placeholder: in production generate real QR with library
  return (
    <div className="bg-white p-4 rounded shadow mt-3">
      <div className="font-semibold mb-2">QR / Enlace público</div>
      <a className="text-indigo-600" href={texto} target="_blank" rel="noreferrer">{texto}</a>
    </div>
  )
}
