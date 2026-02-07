export default function Dashboard() {
  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg">
          <p className="text-3xl font-bold">123</p>
          <p className="text-sm text-gray-400">Some text</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <p className="text-3xl font-bold">123</p>
          <p className="text-sm text-gray-400">Some text</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <p className="text-3xl font-bold">123</p>
          <p className="text-sm text-gray-400">Some text</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6 mt-8">
        <div className="col-span-3">
          <h2 className="text-lg font-semibold mb-4">Most Recent Flags</h2>
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm bg-gray-700 border-b border-gray-800">
                <th className="text-left py-3 px-4 whitespace-nowrap">Flag Name</th>
                <th className="text-left py-3 px-4">Environment</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-600">
                <td className="py-3 px-4 whitespace-nowrap">New Checkout Flow</td>
                <td className="py-3 px-4">
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    dev
                  </span>
                </td>
                <td className="py-3 px-4">Yesterday</td>
                <td className="py-3 px-4">Active</td>
              </tr>
              <tr className="border-b border-gray-600">
                <td className="py-3 px-4 whitespace-nowrap">Beta Feature Toggle</td>
                <td className="py-3 px-4">
                  <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                    staging
                  </span>
                </td>
                <td className="py-3 px-4">3 days ago</td>
                <td className="py-3 px-4">Inactive</td>
              </tr>
              <tr className="border-b border-gray-600">
                <td className="py-3 px-4 whitespace-nowrap">Dark Mode Enabled</td>
                <td className="py-3 px-4">
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">prod</span>
                </td>
                <td className="py-3 px-4">Last week</td>
                <td className="py-3 px-4">Active</td>
              </tr>
              <tr className="border-b border-gray-600">
                <td className="py-3 px-4 whitespace-nowrap">Promo Banner</td>
                <td className="py-3 px-4">
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    dev
                  </span>
                </td>
                <td className="py-3 px-4">Last week</td>
                <td className="py-3 px-4">Inactive</td>
              </tr>
              <tr className="border-b border-gray-600">
                <td className="py-3 px-4 whitespace-nowrap">API Rate Limit</td>
                <td className="py-3 px-4">
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">prod</span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">2 weeks ago</td>
                <td className="py-3 px-4 whitespace-nowrap">Active</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="col-span-2">
          <h2 className="text-lg font-semibold mb-4">Environment Activity</h2>
          <div className="space-y-0">
            <div className="flex items-start gap-3 border-b border-gray-800 py-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-purple-500"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">Emily Wu</p>
                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                    dev
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Tagging Dark Mode Enabled</p>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">10 mins ago</p>
            </div>
            <div className="flex items-start gap-3 border-b border-gray-800 py-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-gray-500"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">Sarah Kim</p>
                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                    dev
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Targeting user_789</p>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">1 hour ago</p>
            </div>
            <div className="flex items-start gap-3 border-b border-gray-800 py-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-blue-500"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">Alex Jones</p>
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    prod
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Rollout 35% for New Checkout_Flow</p>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">3 hours ago</p>
            </div>
            <div className="flex items-start gap-3 border-b border-gray-800 py-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-purple-500"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">Emily Wu</p>
                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                    dev
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Tagging user_456 for Promo Banner</p>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">5 hours ago</p>
            </div>
            <div className="flex items-start gap-3 py-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-amber-600"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">John Doe</p>
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    prod
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Enabled API Rate Limit for 5% of users</p>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">8 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-lg p-6">
            <p className="font-semibold mb-2">Create a Project</p>
            <p className="text-sm text-gray-400 mb-4">
              Organize your feature flags into logical projects.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg">
              Get Started
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <p className="font-semibold mb-2">2. Add Your First Flag</p>
            <p className="text-sm text-gray-400 mb-4">
              Define a new feature flag and set its targeting rules.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg">
              Get Started
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <p className="font-semibold mb-2">3. Install the SDK</p>
            <p className="text-sm text-gray-400 mb-4">
              Integrate Flagline into your app using our SDK.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg">
              Get Started
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <p className="font-semibold mb-2">4. Deploy with Flags</p>
            <p className="text-sm text-gray-400 mb-4">
              Control your feature rollouts through Flagline.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
