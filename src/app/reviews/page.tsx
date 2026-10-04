export const dynamic = "force-dynamic";

const reviews = [
  {
    name: "Manjit Sharma",
    text: "Having a great work experience with great dream.",
    stars: 5,
  },
  {
    name: "Vijay Yadav",
    text: "Wow so amazing wood carving design!",
    stars: 5,
  },
  {
    name: "Ranjeet Vishwakarma",
    text: "Tiger work is superb!",
    stars: 5,
  },
];

export default function ReviewsPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <p className="text-gray-700">What our customers say about our work.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <div key={r.name} className="rounded border p-4">
            <div className="text-sm text-gray-600">
              {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
            </div>
            <div className="mt-2 text-gray-800">“{r.text}”</div>
            <div className="mt-3 font-semibold">{r.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}