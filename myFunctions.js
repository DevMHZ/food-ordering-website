/* ==========================================================================
   myFunctions.js - ملف البرمجة الموحد لموقع مطعم الأصالة
   مادة: تصميم وتطوير تطبيقات الوب - IWB201
   يستخدم مكتبة jQuery
   ========================================================================== */

$(document).ready(function () {

    /* ======================================================================
       1) إظهار / إخفاء تفاصيل الوجبات
          - يمكن إظهار تفاصيل عدة وجبات في نفس الوقت
          - الضغط مرة ثانية يخفي التفاصيل
       ====================================================================== */
    $(document).on('click', '.btn-toggle', function () {
        var targetId = $(this).data('target');
        var $row = $('#' + targetId);
        var $btn = $(this);

        $row.toggle();

        if ($row.is(':visible')) {
            $btn.text('إخفاء').addClass('active');
        } else {
            $btn.text('إظهار').removeClass('active');
        }
    });

    /* ======================================================================
       2) زر "متابعة" - إظهار نموذج معلومات الطلب
          - يجب اختيار وجبة واحدة على الأقل
          - يتم التمرير إلى النموذج بسلاسة
       ====================================================================== */
    $('#btnContinue').on('click', function () {
        var selectedCount = $('.meal-check:checked').length;

        if (selectedCount === 0) {
            alert('الرجاء اختيار وجبة واحدة على الأقل قبل المتابعة.');
            return;
        }

        $('#orderFormSection').slideDown(300);

        $('html, body').animate({
            scrollTop: $('#orderFormSection').offset().top - 80
        }, 500);
    });

    /* ======================================================================
       3) دوال التحقق من صحة المدخلات (Validation Functions)
       ====================================================================== */

    // التحقق من الاسم: أحرف هجائية إنكليزية فقط مع فراغ واحد بين الاسم والكنية
    function validateName(name) {
        var pattern = /^[A-Za-z]+ [A-Za-z]+$/;
        return pattern.test(name);
    }

    // التحقق من رقم الحساب المصرفي: 6 خانات (أرقام فقط، يمكن أن يبدأ بصفر)
    function validateBankAccount(value) {
        var pattern = /^\d{6}$/;
        return pattern.test(value);
    }

    // التحقق من التاريخ بصيغة dd-mm-yyyy وأنه تاريخ صحيح فعلاً
    function validateDate(value) {
        var pattern = /^(\d{2})-(\d{2})-(\d{4})$/;
        var match = value.match(pattern);
        if (!match) return false;

        var day = parseInt(match[1], 10);
        var month = parseInt(match[2], 10);
        var year = parseInt(match[3], 10);

        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > 2100) return false;

        // التحقق من عدد الأيام في كل شهر مع مراعاة السنوات الكبيسة
        var daysInMonth = new Date(year, month, 0).getDate();
        if (day > daysInMonth) return false;

        return true;
    }

    // التحقق من رقم الموبايل: شبكة Syriatel (093, 098, 099) و MTN (094, 095, 096)
    function validateMobile(value) {
        var pattern = /^09[345689]\d{7}$/;
        return pattern.test(value);
    }

    /* ======================================================================
       4) إظهار رسائل الخطأ وتلوين الحقول
       ====================================================================== */
    function showError($input, message) {
        $input.removeClass('valid').addClass('invalid');
        $('#err-' + $input.attr('id')).text(message);
    }

    function showValid($input) {
        $input.removeClass('invalid').addClass('valid');
        $('#err-' + $input.attr('id')).text('');
    }

    function clearStatus($input) {
        $input.removeClass('invalid valid');
        $('#err-' + $input.attr('id')).text('');
    }

    /* ======================================================================
       5) التحقق الفوري أثناء الكتابة (يمنح المستخدم تجربة أفضل)
       ====================================================================== */
    $('#fullName').on('blur', function () {
        var val = $(this).val().trim();
        if (val === '') {
            clearStatus($(this));
        } else if (validateName(val)) {
            showValid($(this));
        } else {
            showError($(this), 'الاسم يجب أن يحوي أحرف إنكليزية فقط مع فراغ واحد بين الاسم والكنية');
        }
    });

    $('#bankAccount').on('blur', function () {
        var val = $(this).val().trim();
        if (val === '') {
            showError($(this), 'رقم الحساب المصرفي إلزامي');
        } else if (validateBankAccount(val)) {
            showValid($(this));
        } else {
            showError($(this), 'رقم الحساب يجب أن يتألف من 6 خانات رقمية');
        }
    });

    // منع إدخال أي محرف غير رقمي في حقل رقم الحساب المصرفي
    $('#bankAccount').on('input', function () {
        $(this).val($(this).val().replace(/\D/g, '').slice(0, 6));
    });

    $('#orderDate').on('blur', function () {
        var val = $(this).val().trim();
        if (val === '') {
            clearStatus($(this));
        } else if (validateDate(val)) {
            showValid($(this));
        } else {
            showError($(this), 'تاريخ غير صحيح، يجب أن يكون بصيغة dd-mm-yyyy');
        }
    });

    $('#mobile').on('blur', function () {
        var val = $(this).val().trim();
        if (val === '') {
            clearStatus($(this));
        } else if (validateMobile(val)) {
            showValid($(this));
        } else {
            showError($(this), 'رقم موبايل غير صحيح، يجب أن يطابق Syriatel (093/098/099) أو MTN (094/095/096)');
        }
    });

    // قبول أرقام فقط في حقل الموبايل
    $('#mobile').on('input', function () {
        $(this).val($(this).val().replace(/\D/g, '').slice(0, 10));
    });

    /* ======================================================================
       6) عند إرسال النموذج: التحقق من جميع المدخلات وعرض ملخص الطلب
       ====================================================================== */
    $('#orderForm').on('submit', function (e) {
        e.preventDefault();

        var isValid = true;

        var name = $.trim($('#fullName').val());
        var bank = $.trim($('#bankAccount').val());
        var date = $.trim($('#orderDate').val());
        var mobile = $.trim($('#mobile').val());

        // ----- الاسم: اختياري، ولكن إذا أُدخل يجب أن يكون صحيحاً -----
        if (name === '') {
            clearStatus($('#fullName'));
        } else if (!validateName(name)) {
            showError($('#fullName'), 'الاسم يجب أن يحوي أحرف إنكليزية فقط مع فراغ واحد بين الاسم والكنية');
            isValid = false;
        } else {
            showValid($('#fullName'));
        }

        // ----- رقم الحساب المصرفي: إلزامي -----
        if (bank === '') {
            showError($('#bankAccount'), 'رقم الحساب المصرفي إلزامي');
            isValid = false;
        } else if (!validateBankAccount(bank)) {
            showError($('#bankAccount'), 'رقم الحساب يجب أن يتألف من 6 خانات رقمية');
            isValid = false;
        } else {
            showValid($('#bankAccount'));
        }

        // ----- التاريخ: اختياري، ولكن إذا أُدخل يجب أن يكون صحيحاً -----
        if (date === '') {
            clearStatus($('#orderDate'));
        } else if (!validateDate(date)) {
            showError($('#orderDate'), 'تاريخ غير صحيح، يجب أن يكون بصيغة dd-mm-yyyy');
            isValid = false;
        } else {
            showValid($('#orderDate'));
        }

        // ----- الموبايل: اختياري، ولكن إذا أُدخل يجب أن يكون صحيحاً -----
        if (mobile === '') {
            clearStatus($('#mobile'));
        } else if (!validateMobile(mobile)) {
            showError($('#mobile'), 'رقم موبايل غير صحيح، يجب أن يطابق Syriatel (093/098/099) أو MTN (094/095/096)');
            isValid = false;
        } else {
            showValid($('#mobile'));
        }

        // التحقق من اختيار وجبة على الأقل
        if ($('.meal-check:checked').length === 0) {
            alert('لم يتم اختيار أي وجبة. يرجى الرجوع إلى الجدول واختيار وجبة على الأقل.');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // ===== كل البيانات صحيحة - بناء وعرض ملخص الطلب =====
        var customer = {
            name: name || '(لم يُذكر)',
            bank: bank,
            date: date || '(لم يُذكر)',
            mobile: mobile || '(لم يُذكر)'
        };

        showOrderSummary(customer);
    });

    /* ======================================================================
       7) بناء وعرض نافذة ملخص الطلب
          - تتضمن: الوجبات المختارة، المبلغ الإجمالي، الضريبة 10%، المبلغ الصافي
       ====================================================================== */
    function showOrderSummary(customer) {
        var totalAmount = 0;
        var rowsHtml = '';

        $('.meal-check:checked').each(function () {
            var $row = $(this).closest('tr.meal-row');
            var code = $row.data('code');
            var mealName = $row.data('name');
            var price = parseFloat($row.data('price'));

            totalAmount += price;

            rowsHtml += '<tr>' +
                '<td>' + code + '</td>' +
                '<td>' + mealName + '</td>' +
                '<td>' + formatNumber(price) + ' ل.س</td>' +
                '</tr>';
        });

        var taxAmount = totalAmount * 0.10;
        var netAmount = totalAmount + taxAmount;

        var summaryHtml =
            '<div class="customer-info">' +
                '<p><strong>اسم مقدم الطلب:</strong> ' + customer.name + '</p>' +
                '<p><strong>رقم الحساب المصرفي:</strong> ' + customer.bank + '</p>' +
                '<p><strong>تاريخ الطلب:</strong> ' + customer.date + '</p>' +
                '<p><strong>رقم الموبايل:</strong> ' + customer.mobile + '</p>' +
            '</div>' +
            '<h4>الوجبات المختارة</h4>' +
            '<table class="summary-table">' +
                '<thead><tr><th>الرمز</th><th>الوجبة</th><th>السعر</th></tr></thead>' +
                '<tbody>' + rowsHtml + '</tbody>' +
            '</table>' +
            '<div class="summary-totals">' +
                '<div class="row"><span>المبلغ الإجمالي:</span> <span>' + formatNumber(totalAmount) + ' ل.س</span></div>' +
                '<div class="row"><span>مبلغ الضريبة (10%):</span> <span>' + formatNumber(taxAmount) + ' ل.س</span></div>' +
                '<div class="row"><span>المبلغ الصافي بعد حسم الضريبة:</span> <span>' + formatNumber(netAmount) + ' ل.س</span></div>' +
            '</div>';

        $('#orderSummary').html(summaryHtml);
        $('#orderModal').fadeIn(250);
    }

    /* تنسيق الأرقام بفواصل آلاف */
    function formatNumber(num) {
        return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }

    /* ======================================================================
       8) إغلاق النافذة
       ====================================================================== */
    $('#modalClose, #modalOk').on('click', function () {
        $('#orderModal').fadeOut(200);
    });

    // إغلاق عند الضغط خارج المحتوى
    $('#orderModal').on('click', function (e) {
        if (e.target === this) {
            $(this).fadeOut(200);
        }
    });

    // إغلاق عند الضغط على Escape
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $('#orderModal').is(':visible')) {
            $('#orderModal').fadeOut(200);
        }
    });

    /* ======================================================================
       9) عند الضغط على زر "تفريغ النموذج" - إعادة تعيين حالة التحقق
       ====================================================================== */
    $('#orderForm').on('reset', function () {
        $('#fullName, #bankAccount, #orderDate, #mobile').each(function () {
            clearStatus($(this));
        });
    });

});
