# Приложение для службы доставки

## Запуск приложения

Для запуска приложения, в интерфейсе командной строки cmd/bash перейдите в каталог advertisement и используйте команду <code>npm start</code> .  
Либо, в интерфейсе командной строки cmd/bash перейдите в корневой каталог проекта и используйте команду <code>docker compose up</code> .

## HTTP маршруты

`POST /api/signup` — зарегистрироваться.  
`POST /api/signin` — залогиниться.  
  
`GET /api/advertisements` — получить список объявлений.  
`GET /api/advertisements/:id` — получить данные объявления.  
  
`POST /api/advertisements` — создать объявление.  
`DELETE /api/advertisements/:id` — удалить объявление.  

## Socket.IO

Сообщения, приходящие в `socket`:  
  
- `getHistory` — получить историю сообщений из чата;  
- `sendMessage` — отправить сообщение пользователю.  
  
События, отправляемые через `socket`:  
  
- `newMessage` — отправлено новое сообщение;  
- `chatHistory` — ответ на событие `getHistory`.  