<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-gray-500">Total Balance</p>
          <p class="text-4xl font-bold">$12,345.67</p>
        </div>
        <div>
          <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full mr-2">Send</button>
          <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full">Receive</button>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Asset
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Balance
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Value (USD)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div class="flex items-center">
                <div class="flex-shrink-0 w-10 h-10">
                  <img class="w-full h-full rounded-full" src="https://via.placeholder.com/40" alt="" />
                </div>
                <div class="ml-3">
                  <p class="text-gray-900 whitespace-no-wrap">
                    Bitcoin
                  </p>
                </div>
              </div>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">0.25 BTC</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">$12,500.00</p>
            </td>
          </tr>
          <tr>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <div class="flex items-center">
                <div class="flex-shrink-0 w-10 h-10">
                  <img class="w-full h-full rounded-full" src="https://via.placeholder.com/40" alt="" />
                </div>
                <div class="ml-3">
                  <p class="text-gray-900 whitespace-no-wrap">
                    Ethereum
                  </p>
                </div>
              </div>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">1.5 ETH</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">$4,500.00</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
