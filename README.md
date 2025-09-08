# Библиотека

    db.books.insertMany([
      {
        title: "Мёртвые души",
        description: "",
        authors: "Н. В. Гоголь",
      },
      {
        title: "Мастер и Маргарита",
        description: "",
        authors: "М. А. Булгаков",
      },
      {
        title: "Отцы и дети",
        description: "",
        authors: "И. С. Тургенев",
      },
    ]);

    db.books.find({ title: "Мастер и Маргарита" }, { _id: 0 });
  
    db.books.updateOne({ _id: 1 }, {
      $set: {
        description: "It is one of the most acclaimed Russian novels of the 19th century.",
        authors: "Ivan Turgenev",
      }
    });
