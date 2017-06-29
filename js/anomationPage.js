/*
* /api/users/1/10 - читати усіх користувачів(перша сторінка 10 записів)
* (1) - номер сторінки яку передивлятись
* (10) - кількість користуачів яку будемо виводити на сторінку
*GET вертає обєкт
* {
*  "data":[],           - тут обєкти корстувачі
*  "page":1,            - тут номер сторінки яку передивляємось
*  "totalitems":100,    - тут загальна к-ть користувачів
*  "limit":10,          - тут скільки користувачів на сторінці(в дата обєкті)
*  "totalPages":10      - тут загальна кількість сторінок яка автоматично рахується
*  сервером в залежності від загальної кількості користувачів та ліміту відображення на сторінці
* }
* /api/users/1/10/preview
* повертає те саме та неповну дату
* "data":[
* {
*  "id":...,
*  "photo":...,
*  "fulname":...,
*  "country":...
* },
* ......
* ]
*
* GET /api/users/<id> + ід - інформація по конкретному юзеру
* GET /api/countrles/ - повертає список(масив) країн
* DELETE /api/users/<id> + ід - видаляє конкретного юзера
* при видалені повертає видалений обєкт
*
* POST /api/users/ - створити користувача,фото можна не передавати север сам добавить
*
*
* логіка:
* - загружається сторінка даємо запит на сервер
* і записуємо на сторінку перших 10 користувачів через привю
* - далі при нажаті на любе місце користувача викидється права панель і заповняється
* форма на редагування якщо зберегти то переписуємо методом пут  і тоді якщо
* пройло все гуд переписуємо інформацію про того конкретного к-ча з ліва
* */

/*http://knockoutjs.com/documentation/submit-binding.html*/

var viewModel = {
    previews:ko.observableArray([]), // масив користувачів
    selectedUser:ko.observable(null), // обсервабл поле вибраного коримтувача
    countries:ko.observableArray([]),
    currentPage:ko.observable(1), // номер сторінки з загальної кількості сторінок яку потрібо завантажити
    pageNumbers:ko.pureComputed(function()
    {
       var pageNumbers=[];
       for (var i=1; i<=viewModel.totalPages();i++)//формування пагінації
       {
           pageNumbers.push(i);//формємо масив з номерами сторінок
       }
       return pageNumbers;
       console.log(pageNumbers);
    }),
    canRemoveSelectedUser:ko.pureComputed(function ()//кнопка видалити активна/не активна
    {
        return viewModel.selectedUser() && viewModel.selectedUser().id;
        // визначаємо якого користувача по ід видалити
    }),
    totalPages:ko.observable(0),// загальна кількість сторінок
    loadPreviews:function()//початкове завантаження користувачів
    {
        $.getJSON("/api/users/"+viewModel.currentPage()+"/10/preview") //тут завантажуємо вкорочану інформацію
            .done(function (response)
            {
                viewModel.totalPages (response.totalPages);// встановлюємо загальну к-ть сторінок які прийшли з сервера
                viewModel.previews(response.data);// передаємомасив юзерів щоо прийшли від сервера
                /*console.log(response);*/
            });
    },
    loadCountries:function ()//завантаження списку країн
    {
      $.getJSON("api/countries")
          .done (function (e)
          {
              viewModel.countries(e);
          });
    },
    editUser:function (userToEdit)//ф-ці вибору конкретного користувача по ід для редагування в формі
    {
        /*console.log(userToEdit);*/
        $.getJSON("/api/users/"+userToEdit.id)
            .done(function (user)
        {
            viewModel.selectedUser(new  User(user));//тут повертається конкретний користувач з повним набором полів
           /* console.log(user);
            console.log(viewModel.selectedUser());*/
        });
    },
    handleSaveUser:function () //тут або додати нового користувача або редагувати
    {
        var type = viewModel.selectedUser().id?"PUT":"POST";
        /*console.log(viewModel.selectedUser().id);*/
        $.ajax
        ({
            url: "/api/users/",
            type: type,
            data:ko.toJSON(viewModel.selectedUser()), // бо обсервабел поля
            contentType:"application/json",
            success: function (savedData)
            {
                viewModel.loadPreviews();
                viewModel.editUser(savedData)
            }
        });
        toastr.success("User saved","Succes");
    },
    goToPrevPage:function ()//стрілочка пагінації назад
    {
        if (viewModel.currentPage()<=1) //якщо поточна сторінка менша рівна 1 то нічого не робити
        {
            return;
        }
        viewModel.goToPage(viewModel.currentPage()-1) // то перейти до сторінки на 1 меншу за поточну
    },
    goToNextPage:function ()//стрілочка пагінації вперід
    {
        if (viewModel.currentPage() >=viewModel.totalPages())
        {
            return;
        }
        viewModel.goToPage(viewModel.currentPage()+1)
    },
    goToPage:function (pageNum)//ф-ія вибору групи ( получаєм номер групи сторінок )
    {
        if (viewModel.currentPage()!= pageNum)
        {
            viewModel.currentPage(pageNum);
            viewModel.loadPreviews();
            // встановлюємо і грузимо користувачів
        }
    },
    removeSelectedUser:function ()//видалення конкретного користувача
    {
        $.ajax
        ({
            url: "/api/users/"+viewModel.selectedUser().id,
            type: "DELETE",
            success: function ()
            {
                viewModel.loadPreviews();
                viewModel.selectedUser(null);
            }
        });
    },
    addNewUser:function ()// додати нового користувача
    {
        viewModel.selectedUser(new User({}));
    },
    cancelSelection:function ()//кнопка кенсел на формі
    {
        viewModel.selectedUser(null);
    },
    openFileDialog:function ()
    {
        document.getElementById("openFileDialogElement").click();
    },
    uploadImage:function (ctx,e)
    {
        /*  console.log(arguments);*/
        var files = e.target.files;// якщо нічого не вибрали то нічого не робити
        if(!files.length)
        {
            return;
        }
        var ourImage = files[0];
        var fileRider = new FileReader();
        fileRider.readAsDataURL(ourImage);
        fileRider.onloadend = function ()
        {
            var dataURI =  fileRider.result;
            viewModel.selectedUser().photo(dataURI);
        };
    }
};
ko.applyBindings(viewModel);
viewModel.loadCountries();
viewModel.loadPreviews();
function User (json)
{
    this.id         =(json.id);
    this.fullName   =(json.fullName);
    this.birthday   =(json.birthday);
    this.profession =(json.profession);
    this.email      =(json.email);
    this.address    =(json.address);
    this.country    =(json.country);
    this.shortInfo  =(json.shortInfo);
    this.fullInfo   =(json.fullInfo);
    this.photo      =ko.observable(json.photo);
}








