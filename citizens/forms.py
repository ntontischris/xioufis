"""
Custom forms for user management with 3-level permission system.

Forms:
- AdminUserCreationForm: For superusers to create Admin users
- RegularUserCreationForm: For admins to create Regular users
"""

from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User, Group
from django.core.exceptions import ValidationError


class AdminUserCreationForm(UserCreationForm):
    """
    Form for superusers to create Admin users.
    Automatically adds user to 'Admins' group and sets staff status.
    """

    email = forms.EmailField(
        required=True,
        label='Email',
        help_text='Απαιτείται έγκυρη διεύθυνση email'
    )

    first_name = forms.CharField(
        max_length=150,
        required=True,
        label='Όνομα',
    )

    last_name = forms.CharField(
        max_length=150,
        required=True,
        label='Επίθετο',
    )

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Greek labels
        self.fields['username'].label = 'Όνομα Χρήστη'
        self.fields['password1'].label = 'Κωδικός'
        self.fields['password2'].label = 'Επιβεβαίωση Κωδικού'

        # Help texts in Greek
        self.fields['username'].help_text = 'Απαιτείται. Μέχρι 150 χαρακτήρες. Μόνο γράμματα, αριθμοί και @/./+/-/_ '
        self.fields['password1'].help_text = 'Τουλάχιστον 10 χαρακτήρες.'

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError('Ένας χρήστης με αυτό το email υπάρχει ήδη.')
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.is_staff = True  # Admin users need staff status

        if commit:
            user.save()
            # Add to Admins group
            admin_group, created = Group.objects.get_or_create(name='Admins')
            user.groups.add(admin_group)

        return user


class RegularUserCreationForm(UserCreationForm):
    """
    Form for admins to create Regular users.
    Automatically adds user to 'Regular Users' group and sets staff status.
    """

    email = forms.EmailField(
        required=True,
        label='Email',
        help_text='Απαιτείται έγκυρη διεύθυνση email'
    )

    first_name = forms.CharField(
        max_length=150,
        required=True,
        label='Όνομα',
    )

    last_name = forms.CharField(
        max_length=150,
        required=True,
        label='Επίθετο',
    )

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Greek labels
        self.fields['username'].label = 'Όνομα Χρήστη'
        self.fields['password1'].label = 'Κωδικός'
        self.fields['password2'].label = 'Επιβεβαίωση Κωδικού'

        # Help texts in Greek
        self.fields['username'].help_text = 'Απαιτείται. Μέχρι 150 χαρακτήρες. Μόνο γράμματα, αριθμοί και @/./+/-/_ '
        self.fields['password1'].help_text = 'Τουλάχιστον 10 χαρακτήρες.'

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError('Ένας χρήστης με αυτό το email υπάρχει ήδη.')
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.is_staff = True  # Regular users need staff status to access admin

        if commit:
            user.save()
            # Add to Regular Users group
            regular_group, created = Group.objects.get_or_create(name='Regular Users')
            user.groups.add(regular_group)

        return user


class AdminUserChangeForm(forms.ModelForm):
    """
    Form for changing Admin user details.
    Prevents removal from Admins group.
    """

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'is_active')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Greek labels
        self.fields['username'].label = 'Όνομα Χρήστη'
        self.fields['first_name'].label = 'Όνομα'
        self.fields['last_name'].label = 'Επίθετο'
        self.fields['is_active'].label = 'Ενεργός'


class RegularUserChangeForm(forms.ModelForm):
    """
    Form for changing Regular user details.
    Prevents removal from Regular Users group.
    """

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'is_active')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Greek labels
        self.fields['username'].label = 'Όνομα Χρήστη'
        self.fields['first_name'].label = 'Όνομα'
        self.fields['last_name'].label = 'Επίθετο'
        self.fields['is_active'].label = 'Ενεργός'
