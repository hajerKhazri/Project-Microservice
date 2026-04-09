from django.contrib.auth import get_user_model
from django.test import TestCase


class UserModelTest(TestCase):
    def test_string_representation(self):
        user = get_user_model()(username="alice", email="alice@example.com")
        self.assertEqual(str(user), "alice")
