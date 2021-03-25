import * as React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {queryCache} from 'react-query'
import {buildUser, buildBook} from 'test/generate'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import {App} from 'app'

// 📜 https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
// 📜 https://testing-library.com/docs/dom-testing-library/api-async#waitfor

afterEach(async () => {
  queryCache.clear()
  await auth.logout()
})

test('renders all the book information', async () => {
  localStorage.setItem(auth.localStorageKey, '__auth_provider_token__')

  const user = buildUser()
  const book = buildBook()
  const route = `/book/${book.id}`
  window.history.pushState({}, 'page title', route)

  window.fetch = async (url, config) => {
    const originalFetch = window.fetch
    if (url.endsWith('/me')) {
      return Promise.resolve({ok: true, json: async () => ({user})})
    }

    if (url.endsWith('/list-items')) {
      return Promise.resolve({ok: true, json: async () => ({listItems: []})})
    }

    if (url.endsWith(`/books/${book.id}`)) {
      return Promise.resolve({ok: true, json: async () => ({book})})
    }

    return originalFetch
  }

  render(<App />, {wrapper: AppProviders})

  waitFor(() => {
    const isLoading = false
    if (queryCache.isFetching() || isLoading) {
      throw new Error('some error')
    }
    expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
    expect(book.author).toBeInTheDocument()
    expect(book.publisher).toBeInTheDocument()
    expect(book.synopsis).toBeInTheDocument()
    expect(book.id).toBeInTheDocument()
    expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
      'src',
      book.coverImageUrl,
    )
    expect(
      screen.getByRole('button', {name: /add to list/i}),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {name: /remove from list/i}),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', {name: /mark as read/i}),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', {name: /mark as unread/i}),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('textarea', {name: /notes/i}),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
  })
})
