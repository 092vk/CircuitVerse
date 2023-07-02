# frozen_string_literal: true

require "rails_helper"

describe "Group management", type: :system do
  before do
    @user = FactoryBot.create(:user)
    @user2 = FactoryBot.create(:user)
    @user3 = FactoryBot.create(:user)
    @group = FactoryBot.create(:group, primary_mentor: @user)
    driven_by(:selenium_chrome_headless)
    login_as(@user, scope: :user)
  end

  after do
    Warden.test_reset!
  end

  it "creates a group" do
    visit "/groups/new"
    fill_in "group[name]", with: "Test"
    click_button "Save"

    expect(page).to have_text("Group was successfully created.")
  end

  it "does not create a group when name is blank" do
    visit "/groups/new"
    fill_in "group[name]", with: ""
    click_button "Save"

    expect(page).to have_text("Name is too short (minimum is 1 character)")
  end

  it "adds a member to the group" do
    visit "/groups/#{@group.id}"
    click_button "+ Add Members"
    execute_script "document.getElementById('addmemberModal').style.display='block'"
    execute_script "document.getElementById('addmemberModal').style.opacity=1"
    execute_script "var new_email = document.createElement('option')
                    new_email.innerHTML = 'example@gmail.com'
                    document.getElementById('group_member_emails').appendChild(new_email)"
    select "example@gmail.com", from: "group_member[emails][]"
    execute_script "document.getElementById('group_email_input').click()"
    click_button "Add members"

    expect(page).to have_text(
      "Out of 1 Email(s), 1 was valid and 0 were invalid. 1 user(s) will be invited."
    )
  end

  it "removes a member from the group" do
    @group.users.append(@user2)
    visit "/groups/#{@group.id}"
    click_on "Remove"
    execute_script "document.getElementById('deletememberModal').style.display='block'"
    execute_script "document.getElementById('deletememberModal').style.opacity=1"
    click_on "Delete"

    expect(page).to have_text("Group member was successfully removed.")
  end

  it "changes the group name" do
    visit "/groups/#{@group.id}"
    click_on "Edit"
    fill_in "group[name]", with: "Example group"
    click_on "Save"

    expect(page).to have_text("Group was successfully updated.")
  end

  it "deletes the group" do
    visit user_groups_path(@user)
    click_on "Delete"
    button = find(id: 'groups-group-delete-button')
    button.click

    expect(page).to have_text("Group was successfully deleted.")
  end

  it "add secondary mentor" do
    visit "/groups/#{@group.id}"
    click_button "+ Add Mentors"
    execute_script "document.getElementById('add-mentor-to-modal').style.display='block'"
    execute_script "document.getElementById('add-mentor-to-modal').style.opacity=1"
    execute_script "var new_email = document.createElement('option')
                    new_email.innerHTML = '" + @user3.email + "'
                    document.getElementById('group_mentor_emails').appendChild(new_email)"
    select @user3.email, from: "group_member[emails][]"
    execute_script "document.getElementById('group_email_input_mentor').click()"
    click_button "Add mentors"

    expect(page).to have_text(
      "Out of 1 Email(s), 1 was valid and 0 were invalid. 1 user(s) will be invited."
    )
  end

  it "remove secondary mentor" do
    GroupMember.create(group_id: @group.id, user_id: @user3.id, mentor: true)
    visit "/groups/#{@group.id}"
    click_on "Remove"
    execute_script "document.getElementById('deletememberModal').style.display='block'"
    execute_script "document.getElementById('deletememberModal').style.opacity=1"
    click_on "Delete"

    expect(page).to have_text("Group member was successfully removed.")
  end

  it "convert member to mentor" do
    GroupMember.create(group_id: @group.id, user_id: @user2.id, mentor: false)
    visit "/groups/#{@group.id}"
    make_mentor_btn = find("a[data-target='#promote-member-modal']")
    make_mentor_btn.click
    execute_script "document.getElementById('promote-member-modal').style.display='block'"
    execute_script "document.getElementById('promote-member-modal').style.opacity=1"
    make_mentor_btn = find(id: "groups-member-promote-button")
    make_mentor_btn.click

    expect(page).to have_text("Group member was successfully updated.")
  end

  it "convert mentor to member" do
    GroupMember.create(group_id: @group.id, user_id: @user3.id, mentor: true)
    visit "/groups/#{@group.id}"
    make_mentor_btn = find("a[data-target='#demote-member-modal']")
    make_mentor_btn.click
    execute_script "document.getElementById('demote-member-modal').style.display='block'"
    execute_script "document.getElementById('demote-member-modal').style.opacity=1"
    make_mentor_btn = find(id: "groups-member-demote-button")
    make_mentor_btn.click

    expect(page).to have_text("Group member was successfully updated.")
  end
end
