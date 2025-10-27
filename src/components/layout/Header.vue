<template>
  <header>
    <nav class="bg-white border-gray-200 px-4 py-2.5 dark:bg-gray-800">
        <div class="flex justify-between items-center mx-auto">
                        <router-link to="/" class="block py-2 pr-4 pl-3 text-zinc-700 rounded font-bold text-2xl bg-primary-700 bg-transparent text-primary-700 p-0 dark:text-white" aria-current="page">pegasis</router-link>
            <div class="flex items-center order-2">
                <a href="#" class="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"></a>
                <a href="#" class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">Get started</a>
            </div>
            <div class="justify-between items-center w-full flex w-auto order-1" id="mobile-menu-2">
                <ul class="flex flex-col mt-4 mx-auto font-medium flex-row space-x-8 mt-0">
                    <li>
                        <router-link to="/dashboard" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 hover:bg-transparent border-0 hover:text-primary-700 p-0 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:hover:bg-transparent dark:border-gray-700">Dashboard</router-link>
                    </li>
                    <li>
                        <router-link to="/wallet" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 hover:bg-transparent border-0 hover:text-primary-700 p-0 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:hover:bg-transparent dark:border-gray-700">Wallet</router-link>
                    </li>
                    <li>
                        <router-link to="/market" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 hover:bg-transparent border-0 hover:text-primary-700 p-0 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:hover:bg-transparent dark:border-gray-700">Market</router-link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</header>
</template>
