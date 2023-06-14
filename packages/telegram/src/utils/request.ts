// Generic fetch wrapper that allows specifying a return data type
export default async function request<ResponseType>(
  url: string,
  body?: object
): Promise<ResponseType> {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => data as ResponseType)
}

// Generic fetch wrapper that allows specifying a return data type
// export default async function request<ResponseType>(
//   url: string,
//   body?: object
// ): Promise<ResponseType> {
//   return fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(body),
//   })
//     .then((response) => response.json())
//     .then((data) => data as ResponseType)
// We also can use some post-response data-transformations in the last `then` clause.
// }
