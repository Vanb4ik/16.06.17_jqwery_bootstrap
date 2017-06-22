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
    users: ko.observableArray([]), // масив для списку користувачів
    countries:ko.observableArray([]), // масив для створення списку крїн
    pagination:ko.observableArray([]), // масив для створення пагінацї
    selectedUser:ko.observable(null),// поки selectedUser то заховати форму
    saveUser:function () // збереженя користувача
    {
        /*потрібно знайти користуача та обновити поля в формі
         * по ід найти користувача та переписати фото,..*/
        var oldUser=viewModel.selectedUser(); // створюємо нового користувача і записуємо  ноього знчення

        viewModel.updateUser(oldUser);

       /* toastr.success("User saved","Succes");*/
    },
    updateUser: function (newUser) // обнолення користувачча на сервері при збережені
    {
        var userToUpdate =
            {
                id:newUser.id,
                fullName:newUser.fullName,
                birthday:newUser.birthday,
                profession:newUser.profession,
                country:newUser.country,
                fullInfo:newUser.fullInfo,
                address:newUser.address,
                shortInfo:newUser.shortInfo
                /*фото потім*/
            };
        viewModel.put(userToUpdate);
        toastr.success("User saved","Succes");
    },
    selectUser:function (user) //вибір конкретного корисувача
    {
        /*viewModel.loadUsers();*/
        viewModel.selectedUser(user) ;// а тут вибирається конкретний користувач
       /* console.log(user);*/
    },
    removeSelecttedUser:function () // видалення користуваа
    {
        var user=viewModel.selectedUser();

        viewModel.delete(user);
        viewModel.selectedUser(null);
    },
    selectGroup:function (selected) //пагінація
    {

        viewModel.loadUsers(selected,null,"");
        viewModel.selectedUser(null);
        /*console.log(selected);*/
    },
    loadUsers:function (slectGroup, amount, preview) //початкове читання користувачів
    {
        var slect = slectGroup||1;
        var amou =amount||5;
        var pre= preview||"";


       /* console.log(slect,amou,pre);*/
        $.ajax
        ({
            url: "/api/users/"+slect+"/"+amou+"/"+pre,
            type: "GET",
            success: function (result)
            {
                var paginationMass = [];
                for (var i =0;i<result.totalPages;i++)
                {
                    paginationMass[i]=i+1;
                }
                viewModel.users(result.data);
                viewModel.pagination(paginationMass);


                // console.log(result);
                // console.log(paginatnionMass)
            }
        });

    },
    cancel:function ()// кенсел  формі
    {
        viewModel.selectedUser(null);//щоб скинути фокус з юзера і форма хоається бо нема вибраного юзера
    },
    loadCountries:function ()//залити країни
    {
        $.ajax
        ({
            url: "/api/countries",
            type: "GET",
            success: function (result)
            {
                viewModel.countries(result);
                 /*console.log(result);*/
                // console.log(paginatnionMass)
            }
        });
    },
    put:function (attr)//редагуання на сервері
    {
        var data =JSON.stringify(attr);
        console.log(attr);
        $.ajax
        ({
            contentType: "application/json",
            url: "/api/users/",
            type: "PUT",
            data: data,
            success: function (result)
            {
                viewModel.loadUsers(null,null,"");
                /*console.log(result);*/

            }
        });
    },
    delete:function (attr) // видалення на сервері
    {
        $.ajax
        ({
            url: "/api/users/"+attr.id,
            type: "DELETE",
            success: function (result)
            {
                viewModel.loadUsers(null,null,"");
            }
        });
    }
};
ko.applyBindings(viewModel);
viewModel.loadUsers(null,null,"");
viewModel.loadCountries();






